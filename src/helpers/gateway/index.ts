import { NodeKind, PropsId, PropsKind } from '@kubevious/entity-meta';
import _ from 'the-lodash';
import { ILogger } from "the-logger";
import { Helpers } from '..';
import { LogicItem } from '../../logic/item';
import { LogicScope } from '../../logic/scope';
import { K8sConfig } from '../../types/k8s';
import { K8sServiceRuntime } from '../../types/parser/k8s-service';

export class GatewayUtils
{
    private _helpers: Helpers;
    private _logger: ILogger;
    private _scope : LogicScope;

    constructor(helpers: Helpers, logger: ILogger, scope: LogicScope)
    {
        this._logger = logger.sublogger("GatewayUtils");
        this._helpers = helpers;
        this._scope = scope;
    }

    private getDomain(domainName: string | undefined)
    {
        const root = this._scope.logicRootNode.fetchByNaming(NodeKind.gateway);
        const domainItem = root.fetchByNaming(NodeKind.domain, domainName);
        return domainItem;
    }

    private getURL(domainName: string | undefined, urlPath: string | undefined)
    {
        const domainItem = this.getDomain(domainName);
        const urlItem = domainItem.fetchByNaming(NodeKind.url, urlPath);
        return urlItem;
    }

    private createIngress(domainName: string | undefined, urlPath: string | undefined, item: LogicItem, ruleConfig: any)
    {        
        const urlItem = this.getURL(domainName, urlPath);

        const itemConfig = <K8sConfig>item.config;
        const ruleName = `${itemConfig.apiVersion}-${itemConfig.kind}-${itemConfig.metadata.namespace}-${itemConfig.metadata.name!}`;

        return this._helpers.shadow.create(item, urlItem,
            {
                kind: NodeKind.ingress,
                name: ruleName,

                linkName: 'k8s',
                inverseLinkName: 'gateway',

                skipUsageRegistration: true
            });
    }

    setupIngress(domainName: string | undefined, urlPath: string | undefined, item: LogicItem, ruleConfig: any, k8sServiceItem: LogicItem)
    {
        const gIngress = this.createIngress(domainName, urlPath, item, ruleConfig);

        const gService = this._helpers.shadow.create(k8sServiceItem, gIngress,
            {
                kind: NodeKind.service,

                linkName: 'k8s',
                inverseLinkName: 'gateway',

                skipUsageRegistration: true
            });

        const serviceRuntime = <K8sServiceRuntime>k8sServiceItem.runtime;

        for(const logicServiceItem of k8sServiceItem.resolveTargetLinkItems('logic'))
        {
            this._logger.error('[setupIngress] logic: %s', logicServiceItem.dn);

            for(const portConfig of _.values(serviceRuntime.portsDict))
            {
                const gPort = gService.fetchByNaming(NodeKind.port, portConfig.id);
                gPort.setConfig(portConfig);
                gPort.addProperties({
                    kind: PropsKind.yaml,
                    id: PropsId.config,
                    config: portConfig.config
                });

                for(const appPortItemDn of _.keys(portConfig.logicPorts))
                {
                    const appPortItem = this._scope.findItem(appPortItemDn)!;
                    const gAppPortItem = this._helpers.shadow.create(appPortItem, gPort, {
                        linkName: 'logic',

                        skipUsageRegistration: true
                    });

                    const app = appPortItem.parent!.parent!;
                    const gApp = this._helpers.shadow.create(app, gAppPortItem, {
                        linkName: 'app',

                        skipUsageRegistration: true
                    });
                }
            }
        }
    }
}   