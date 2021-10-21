import { NodeKind } from '@kubevious/entity-meta';
import _ from 'the-lodash';
import { ILogger } from "the-logger";
import { Helpers } from '..';
import { LogicItem } from '../../logic/item';
import { LogicScope } from '../../logic/scope';
import { K8sConfig } from '../../types/k8s';

export class GatewayUtils
{
    private _helpers: Helpers;
    private _scope : LogicScope;

    constructor(helpers: Helpers, logger: ILogger, scope: LogicScope)
    {
        this._helpers = helpers;
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

        this._helpers.shadow.create(item, urlItem,
            {
                kind: NodeKind.ingress,
                name: ruleName,

                linkName: 'k8s-owner',
                inverseLinkName: 'gateway',

                skipUsageRegistration: true
            });
    }
}   