import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { NodeKind, ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';
import { IngressRoute, IngressRouteConfig, TraefikMiddlewareReference } from './types/ingress-route';
import { TraefikService, TraefikServiceReference } from './types/traefik-service';
import { parseDomainNames, parseEndpointPaths } from './types/route-utils';
import { LogicItem } from '../../logic/item';
import { ServiceBackendPort } from 'kubernetes-types/networking/v1';

export default K8sParser<IngressRoute>()
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


        /*** HELPERS ***/

        function processRoute(route: IngressRouteConfig)
        {
            const domainNames = parseDomainNames(route.match);

            for(const domainName of domainNames)
            {
                const urlPaths = parseEndpointPaths(route.match, domainName);

                for(const urlPath of urlPaths)
                {
                    const gIngress = helpers.gateway.createIngress(domainName, urlPath, item,
                        {
                            kind: NodeKind.traefik_ingress_route,
                        });

                    for(const serviceConfig of (route.services ?? []))
                    {
                        processServiceConfig(serviceConfig, gIngress);
                    }

                    for(const middlewareRef of (route.middlewares ?? []))
                    {
                        processMiddleware(middlewareRef, gIngress);
                    }

                    processTLSOptions(gIngress);
                }
            }
        }

        function processTLSOptions(gIngress: LogicItem)
        {
            if (config.spec?.tls?.options)
            {
                const tlsName = config.spec.tls.options.name;
                if (tlsName)
                {
                    const tlsOptionsItem = helpers.thirdParty.traefik.findTLSOptions(
                        config.spec.tls.options!.namespace ?? namespace!, 
                        tlsName);

                    if (tlsOptionsItem)
                    {
                        helpers.shadow.create(tlsOptionsItem, gIngress,
                            {
                                kind: NodeKind.traefik_tls_opts,
                
                                linkName: LogicLinkKind.k8s,
        
                                inverseLinkName: LogicLinkKind.gateway,
                                inverseLinkPath: metadata.name!
                            });
                    }
                    else
                    {
                        item.raiseAlert(ValidatorID.TRAEFIK_MISSING_TLS_OPTIONS, `TLSOPtions ${tlsName} is missing.`);
                    }
                }
            }
        }

        function processMiddleware(
            middlewareRef: TraefikMiddlewareReference,
            gIngress: LogicItem)
        {
            let middlewareItem : LogicItem | null = null;

            if (middlewareRef.name.includes('@'))
            {
                middlewareItem = helpers.thirdParty.traefik.findGlobalMiddleware(
                    middlewareRef.name);
            }
            else
            {
                middlewareItem = helpers.thirdParty.traefik.findLocalMiddleware(
                    middlewareRef.namespace ?? namespace!,
                    middlewareRef.name);
            }
            
            if (middlewareItem)
            {
                helpers.shadow.create(middlewareItem, gIngress,
                    {
                        kind: NodeKind.traefik_middleware,
        
                        linkName: LogicLinkKind.k8s,

                        inverseLinkName: LogicLinkKind.gateway,
                        inverseLinkPath: metadata.name!
                    });
            }
            else
            {
                item.raiseAlert(ValidatorID.TRAEFIK_MISSING_MIDDLEWARE, `Middleware ${middlewareRef.name} is missing.`);
            }
        }

        function processServiceConfig(
            serviceConfig: TraefikServiceReference,
            gOwner: LogicItem)
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
                    gOwner,
                    namespace!,
                    serviceConfig.name,
                    servicePort,
                    NodeKind.traefik_ingress_route);
            }
            else if (serviceConfig.kind === 'TraefikService')
            {
                processTraefikService(serviceConfig, gOwner);
            }

        }

        function processTraefikService(
            serviceConfig: TraefikServiceReference,
            gOwner: LogicItem)
        {
            const traefikServiceDn = helpers.k8s.makeDn(namespace!, config.apiVersion, 'TraefikService', serviceConfig.name);
            const traefikServiceItem = item.link(LogicLinkKind.service, traefikServiceDn);
    
            if (traefikServiceItem)
            {
                const gTraefikService = helpers.shadow.create(traefikServiceItem, gOwner,
                    {
                        kind: NodeKind.traefik_service,
        
                        linkName: LogicLinkKind.k8s,

                        inverseLinkName: LogicLinkKind.gateway,
                        inverseLinkPath: metadata.name!
                    });
                
                const traefikServiceConfig = traefikServiceItem.config as TraefikService;

                for (const weightedServiceConfig of traefikServiceConfig?.spec?.weighted?.services ?? [])
                {
                    processServiceConfig(weightedServiceConfig, gTraefikService);
                }
               
                for (const mirroredServiceConfig of traefikServiceConfig?.spec?.mirroring?.mirrors ?? [])
                {
                    processServiceConfig(mirroredServiceConfig, gTraefikService);
                }
               
            }
            else
            {
                item.raiseAlert(ValidatorID.TRAEFIK_MISSING_SERVICE, `TraefikService ${serviceConfig.name} is missing.`);
            }
        }

    })
    ;
