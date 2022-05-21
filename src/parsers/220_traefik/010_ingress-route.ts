import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind, ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';
import { IngressRoute, IngressRouteConfig, IngressRouteServiceConfig } from './types/ingress-route';
import { parseDomainName, parseEndpointPath } from './types/route-utils';
import { LogicItem } from '../../logic/item';
import { ServiceBackendPort } from 'kubernetes-types/networking/v1';

export default K8sParser<IngressRoute>()
    .trace()
    .target({
        api: "traefik.containo.us",
        kind: "IngressRoute"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        if (!config.spec) {
            return;
        }
        
        for(const route of config.spec.routes ?? [])
        {

            processRoute(route);

        }
        
        // if (config.spec.defaultBackend) {
        //     processIngressBackend(config.spec.defaultBackend, undefined, undefined);
        // }

        // const rules = config.spec.rules ?? [];
        // for(const ruleConfig of rules)
        // {
        //     if (ruleConfig.http && ruleConfig.http.paths)
        //     {
        //         for(const pathConfig of ruleConfig.http.paths)
                
        //         {
        //             if (pathConfig.backend)
        //             {
        //                 processIngressBackend(pathConfig.backend, pathConfig, ruleConfig);
        //             }
        //         }
        //     }
        // }

        // if (item.resolveTargetLinks(LogicLinkKind.app).length == 0)
        // {
        //     item.raiseAlert(ValidatorID.INGRESS_NOT_MOUNT_TO_APPS, 'Could not match Ingress to Services.')
        // }


        /*** HELPERS ***/

        function processRoute(route: IngressRouteConfig)
        {
            const domainName = parseDomainName(route.match);
            const urlPath = parseEndpointPath(route.match);

            const gIngress = helpers.gateway.createIngress(domainName, urlPath, item);

            for(const serviceConfig of (route.services ?? []))
            {
                processServiceConfig(serviceConfig, gIngress);
            }
        }

        function processServiceConfig(
            serviceConfig: IngressRouteServiceConfig,
            gIngress: LogicItem)
        {
            if (serviceConfig.kind === 'Service' ||
                !serviceConfig.kind)
            {
                const servicePort: ServiceBackendPort = {}
                if (_.isNumber(serviceConfig.port)) {
                    servicePort.number = serviceConfig.port;
                }
                else if (_.isString(serviceConfig.port)) {
                    servicePort.name = serviceConfig.port;
                }

                helpers.gateway.findAndMountService(
                    item,
                    gIngress,
                    namespace!,
                    serviceConfig.name,
                    servicePort);
            }
            else if (serviceConfig.kind === 'TraefikService')
            {
                processTraefikService(serviceConfig, gIngress);
            }

        }

        function processTraefikService(
            serviceConfig: IngressRouteServiceConfig,
            gIngress: LogicItem)
        {
            const traefikServiceDn = helpers.k8s.makeDn(namespace!, config.apiVersion, 'TraefikService', serviceConfig.name);
            const traefikServiceItem = item.link(LogicLinkKind.service, traefikServiceDn);
    
            if (traefikServiceItem)
            {
                const gTraefikService = helpers.shadow.create(traefikServiceItem, gIngress,
                    {
                        kind: NodeKind.service,
        
                        linkName: LogicLinkKind.k8s,
                        inverseLinkName: LogicLinkKind.gateway,
        
                        skipUsageRegistration: true
                    });
               
            }
            else
            {
                item.raiseAlert(ValidatorID.MISSING_INGRESS_SERVICE, `TraefikService ${serviceConfig.name} is missing.`);
            }
        }

    })
    ;
