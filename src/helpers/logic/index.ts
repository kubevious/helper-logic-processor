import { NodeKind } from '@kubevious/entity-meta';
import _ from 'the-lodash';
import { ILogger } from "the-logger";
import { Helpers } from '..';
import { LogicItem } from '../../logic/item';
import { LogicScope } from '../../logic/scope';
import { K8sConfig } from '../../types/k8s';
import { LogicAppRuntime } from '../../types/parser/logic-app';

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

                linkName: 'k8s-owner',
                inverseLinkName: 'logic'
            });
    }
}   