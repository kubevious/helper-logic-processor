import { NodeKind } from '@kubevious/entity-meta';
import { ObjectMeta } from 'kubernetes-types/meta/v1';
import _ from 'the-lodash';
import { ILogger } from "the-logger";
import { Helpers } from '..';
import { LogicItem } from '../../logic/item';
import { LogicScope } from '../../logic/scope';
import { K8sConfig } from '../../types/k8s';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicCommonWorkload } from '../../types/parser/logic-common';
import { makeRelativeName } from '../../utils/name-helpers';


export class LogicUtils
{
    private _helpers: Helpers;
    private _logger: ILogger;
    private _scope : LogicScope;

    constructor(helpers: Helpers, logger: ILogger, scope: LogicScope)
    {
        this._helpers = helpers;
        this._logger = logger;
        this._scope = scope;
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

                linkName: 'k8s',
                inverseLinkName: 'logic',
                inverseLinkPath: name
            });
    }

    processOwnerReferences(item : LogicItem, kind: NodeKind, metadata: ObjectMeta)
    {
        const ownerReferences = metadata.ownerReferences ?? [];
        for(const ref of ownerReferences)
        {
            const ownerDn = this._helpers.k8s.makeDn(metadata.namespace!, ref.apiVersion, ref.kind, ref.name);
            const owner = item.link('owner', ownerDn);
            if (owner)
            {                    
                const shortName = makeRelativeName(owner.naming, metadata.name!);

                const logicOwner = owner.resolveTargetLinkItem('logic');
                if (logicOwner)
                { 
                    const selfLogicItem = this._helpers.shadow.create(item, logicOwner,
                        {
                            kind: kind,
                            name: shortName,
                            linkName: 'k8s',
                            inverseLinkName: 'logic',
                        });

                    const logicOwnerRuntime = <LogicCommonWorkload>logicOwner.runtime;
                    if (logicOwnerRuntime)
                    {
                        (<LogicCommonWorkload>selfLogicItem.runtime).namespace = logicOwnerRuntime.namespace;
                        (<LogicCommonWorkload>selfLogicItem.runtime).app = logicOwnerRuntime.app;
                    }
            
                }
            }
        }
    }
}   