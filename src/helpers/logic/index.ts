import { NodeKind } from '@kubevious/entity-meta';
import _ from 'the-lodash';
import { ILogger } from "the-logger";
import { LogicItem } from '../../logic/item';
import { LogicScope } from '../../logic/scope';
import { K8sConfig } from '../../types/k8s';
import { LogicAppRuntime } from '../../types/parser/logic-app';

export class LogicUtils
{
    private _logger: ILogger;
    private _scope : LogicScope;

    constructor(logger: ILogger, scope: LogicScope)
    {
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

        while(app.findByNaming(NodeKind.ingress, name))
        {
            name = name + '_';
        }

        const logicIngress = app.fetchByNaming(NodeKind.ingress, name);
        logicIngress.makeShadowOf(k8sIngress);
        k8sIngress.link('logic', logicIngress);
    }
}   