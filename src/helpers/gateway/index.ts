import { NodeKind, PropsId, PropsKind, ValidatorID } from '@kubevious/entity-meta';
import { ServiceBackendPort } from 'kubernetes-types/networking/v1';
import _ from 'the-lodash';
import { ILogger } from "the-logger";
import { Helpers } from '..';
import { LogicItem } from '../../logic/item';
import { LogicLinkKind } from '../../logic/link-kind';
import { LogicScope } from '../../logic/scope';
import { K8sConfig } from '../../types/k8s';
import { K8sServicePort, K8sServiceRuntime } from '../../types/parser/k8s-service';

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

    private createIngress(domainName: string | undefined, urlPath: string | undefined, item: LogicItem)
    {        
        const urlItem = this.getURL(domainName, urlPath);

        const itemConfig = <K8sConfig>item.config;
        const ruleName = `${itemConfig.apiVersion}-${itemConfig.kind}-${itemConfig.metadata.namespace}-${itemConfig.metadata.name!}`;

        return this._helpers.shadow.create(item, urlItem,
            {
                kind: NodeKind.ingress,
                name: ruleName,

                linkName: LogicLinkKind.k8s,
                inverseLinkName: LogicLinkKind.gateway,

                skipUsageRegistration: true
            });
    }

    setupIngress(domainName: string | undefined, urlPath: string | undefined, item: LogicItem, k8sServiceItem?: LogicItem | null, servicePort?: ServiceBackendPort)
    {
        const gIngress = this.createIngress(domainName, urlPath, item);

        if (!k8sServiceItem) {
            return;
        }

        const gService = this._helpers.shadow.create(k8sServiceItem, gIngress,
            {
                kind: NodeKind.service,

                linkName: LogicLinkKind.k8s,
                inverseLinkName: LogicLinkKind.gateway,

                skipUsageRegistration: true
            });

        const serviceRuntime = <K8sServiceRuntime>k8sServiceItem.runtime;

        if (!servicePort) {
            return;
        }
        
        let servicePortConfig : K8sServicePort | undefined;

        if (servicePort.number) {
            servicePortConfig = serviceRuntime.portsByNumber[servicePort.number];
            if (!servicePortConfig) {
                item.raiseAlert(ValidatorID.MISSING_INGRESS_SERVICE_PORT, `Service ${k8sServiceItem.naming} is missing port ${servicePort.number}.`);
            }
        }
        else if (servicePort.name) {
            servicePortConfig = serviceRuntime.portsByName[servicePort.name];
            if (!servicePortConfig) {
                item.raiseAlert(ValidatorID.MISSING_INGRESS_SERVICE_PORT, `Service ${k8sServiceItem.naming} is missing port ${servicePort.name}.`);
            }
        }

        if (!servicePortConfig) {
            return;
        }

        const gPort = gService.fetchByNaming(NodeKind.port, servicePortConfig.id);
        gPort.setConfig(servicePortConfig);
        gPort.addProperties({
            kind: PropsKind.yaml,
            id: PropsId.config,
            config: servicePortConfig.config
        });

        for(const appPortItemDn of _.keys(servicePortConfig.logicPorts))
        {
            const appPortItem = this._scope.findItem(appPortItemDn)!;
            const gAppPortItem = this._helpers.shadow.create(appPortItem, gPort, {
                linkName: LogicLinkKind.logic,

                skipUsageRegistration: true
            });

            const app = appPortItem.parent!.parent!;
            const gApp = this._helpers.shadow.create(app, gAppPortItem, {
                linkName: LogicLinkKind.app,

                skipUsageRegistration: true
            });
        }
    }
}   