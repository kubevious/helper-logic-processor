import _ from 'the-lodash';

import { ObjectMeta } from 'kubernetes-types/meta/v1';

import { NodeKind } from '@kubevious/entity-meta';
import { ILogger } from "the-logger";

import { Helpers } from '..';
import { LogicItem } from '../../logic/item';
import { LogicScope } from '../../logic/scope';
import { K8sConfig } from '../../types/k8s';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicCommonWorkload } from '../../types/parser/logic-common';
import { makeRelativeName } from '../../utils/name-helpers';

import { makeDn } from '../../utils/dn-utils';
import { LogicLinkKind } from '../../logic/link-kind';

import { LogicHealthUtils } from './health';

export class LogicUtils
{
    private _helpers: Helpers;
    private _logger: ILogger;
    private _scope : LogicScope;

    public health: LogicHealthUtils;

    constructor(helpers: Helpers, logger: ILogger, scope: LogicScope)
    {
        this._helpers = helpers;
        this._logger = logger;
        this._scope = scope;

        this.health = new LogicHealthUtils(helpers, logger, scope);
    }

    makeAppDn(namespace: string, name: string)
    {
        return makeDn([
            { kind: NodeKind.root },
            { kind: NodeKind.logic },
            { kind: NodeKind.ns, name: namespace },
            { kind: NodeKind.app, name: name }
        ]);
    }

    createIngress(app: LogicItem, k8sIngress: LogicItem) : void
    {
        const config = <K8sConfig>k8sIngress.config;
        let name = config.metadata.name!;

        const runtime = <LogicAppRuntime>app.runtime;
        if (!runtime.ingresses) {
            runtime.ingresses = {};
        }

        if (runtime.ingresses[k8sIngress.dn]) {
            return;
        }
        runtime.ingresses[k8sIngress.dn] = true;

        if (app.findByNaming(NodeKind.ingress, name))
        {
            name = name + '_';
            let counter = 2;
            while(app.findByNaming(NodeKind.ingress, `${name}${counter}`))
            {
                name = `${name}${counter}`;
                counter++;
            }
        }

        this._helpers.shadow.create(k8sIngress, app,
            {
                kind: NodeKind.ingress,
                name: name,

                linkName: LogicLinkKind.k8s,
                inverseLinkName: LogicLinkKind.logic,
                inverseLinkPath: name
            });
    }

    processOwnerReferences(item : LogicItem, kind: NodeKind, metadata: ObjectMeta, params? : { addToAppOwnersDict ? : boolean })
    {
        params = params ?? {};

        const ownerReferences = metadata.ownerReferences ?? [];
        for(const ref of ownerReferences)
        {
            const ownerDn = this._helpers.k8s.makeDn(metadata.namespace!, ref.apiVersion, ref.kind, ref.name);
            const owner = item.link(LogicLinkKind.owner, ownerDn);
            if (owner)
            {                    
                const shortName = makeRelativeName(owner.naming, metadata.name!);

                const logicOwner = owner.resolveTargetLinkItem(LogicLinkKind.logic);
                if (logicOwner)
                { 
                    const selfLogicItem = this._helpers.shadow.create(item, logicOwner,
                        {
                            kind: kind,
                            name: shortName,
                            linkName: LogicLinkKind.k8s,
                            inverseLinkName: LogicLinkKind.logic,
                        });

                    const selfLogicRuntime = (<LogicCommonWorkload>selfLogicItem.runtime);
                    this.health.setupHealthRuntime(selfLogicRuntime);

                    const logicOwnerRuntime = <LogicCommonWorkload>logicOwner.runtime;
                    if (logicOwnerRuntime)
                    {
                        selfLogicRuntime.namespace = logicOwnerRuntime.namespace;
                        selfLogicRuntime.app = logicOwnerRuntime.app;

                        if (params.addToAppOwnersDict) {
                            const appDn = this.makeAppDn(logicOwnerRuntime.namespace, logicOwnerRuntime.app);
                            const appItem = this._scope.findItem(appDn);
                            if (appItem)
                            {
                                const appRuntime = (appItem.runtime as LogicAppRuntime);
                                appRuntime.podOwnersDict.register(ref, selfLogicItem);
                            }
                        }
                    }
            
                }
            }
        }
    }
}   