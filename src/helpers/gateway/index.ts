import { NodeKind } from '@kubevious/entity-meta';
import _ from 'the-lodash';
import { ILogger } from "the-logger";
import { LogicItem } from '../../logic/item';
import { LogicScope } from '../../logic/scope';
import { K8sConfig } from '../../types/k8s';

export class GatewayUtils
{
    private _scope : LogicScope;

    constructor(logger: ILogger, scope: LogicScope)
    {
        this._scope = scope;
    }

    getDomain(domainName: string | undefined)
    {
        const root = this._scope.logicRootNode.fetchByNaming(NodeKind.gateway);
        const domainItem = root.fetchByNaming(NodeKind.domain, domainName);
        return domainItem;
    }

    getURL(domainName: string | undefined, urlPath: string | undefined)
    {
        const domainItem = this.getDomain(domainName);
        const urlItem = domainItem.fetchByNaming(NodeKind.url, urlPath);
        return urlItem;
    }

    getRule(domainName: string | undefined, urlPath: string | undefined, item: LogicItem, ruleConfig: any)
    {        
        const urlItem = this.getURL(domainName, urlPath);

        const itemConfig = <K8sConfig>item.config;
        const ruleName = `${itemConfig.apiVersion}-${itemConfig.kind}-${itemConfig.metadata.namespace}-${itemConfig.metadata.name!}`;
        const ruleItem = urlItem.fetchByNaming(NodeKind.ingress, ruleName);

        ruleItem.link('ingress', item);

        ruleItem.setConfig(ruleConfig);

        ruleItem.addProperties({
            kind: "yaml",
            id: "config",
            title: "Config",
            order: 10,
            config: ruleConfig
        });
    }
}   