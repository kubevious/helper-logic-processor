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
import { LogicAppRuntime } from '../../types/parser/logic-app';

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

    createIngress(
        domainName: string | undefined,
        urlPath: string | undefined,
        item: LogicItem,
        options? : { kind?: NodeKind })
    {        
        const urlItem = this.getURL(domainName, urlPath);

        const itemConfig = <K8sConfig>item.config;
        const ruleName = `${itemConfig.apiVersion}-${itemConfig.kind}-${itemConfig.metadata.namespace}-${itemConfig.metadata.name!}`;

        return this._helpers.shadow.create(item, urlItem,
            {
                kind: options?.kind ?? NodeKind.ingress,
                name: ruleName,

                linkName: LogicLinkKind.k8s,
                inverseLinkName: LogicLinkKind.gateway,

                skipUsageRegistration: true
            });
    }

    createService(
        ownerItem: LogicItem,
        gParent: LogicItem,
        k8sServiceItem: LogicItem,
        servicePort?: ServiceBackendPort)
    {
        const gService = this._helpers.shadow.create(k8sServiceItem, gParent,
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
                ownerItem.raiseAlert(ValidatorID.MISSING_INGRESS_SERVICE_PORT, `Service ${k8sServiceItem.naming} is missing port ${servicePort.number}.`);
            }
        }
        else if (servicePort.name) {
            servicePortConfig = serviceRuntime.portsByName[servicePort.name];
            if (!servicePortConfig) {
                ownerItem.raiseAlert(ValidatorID.MISSING_INGRESS_SERVICE_PORT, `Service ${k8sServiceItem.naming} is missing port ${servicePort.name}.`);
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

    findAndMountService(
        item: LogicItem,
        gOwner: LogicItem,
        namespace: string,
        serviceName: string | undefined,
        servicePort: ServiceBackendPort)
    {
        if (!serviceName) {
            return;
        }

        const serviceDn = this._helpers.k8s.makeDn(namespace!, 'v1', 'Service', serviceName);
        const k8sServiceItem = item.link(LogicLinkKind.service, serviceDn);

        if (k8sServiceItem)
        {
            this._helpers.gateway.createService(
                item,
                gOwner,
                k8sServiceItem,
                servicePort);

            const app = k8sServiceItem.resolveTargetLinkItem(LogicLinkKind.app);
            if (app)
            {
                const appRuntime = <LogicAppRuntime>app.runtime;
                appRuntime.exposedWithIngress = true;

                item.link(LogicLinkKind.app, app);

                this._helpers.logic.createIngress(app, item);
            }
        }
        else
        {
            item.raiseAlert(ValidatorID.MISSING_INGRESS_SERVICE, `Service ${serviceName} is missing.`);
        }

    }
    
}   