import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';
import { IngressRoute, IngressRouteConfig } from './types/ingress-route';

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
            helpers.gateway.setupIngress(route.match ?? "*", route.match ?? "/", item);
            // const domainName = ruleConfig?.host;
            // const urlPath = pathConfig?.path ?? '*';

            // const service = backend?.service;
            // const serviceName = service?.name;
            // if (!serviceName) {
            //     helpers.gateway.setupIngress(domainName, urlPath, item);
            //     return 
            // }

            // const serviceDn = helpers.k8s.makeDn(namespace!, 'v1', 'Service', serviceName);
            // const k8sServiceItem = item.link(LogicLinkKind.service, serviceDn);

            // helpers.gateway.setupIngress(domainName, urlPath, item, k8sServiceItem, service.port ?? {});

            // if (k8sServiceItem)
            // {
            //     const app = k8sServiceItem.resolveTargetLinkItem(LogicLinkKind.app);
            //     if (app)
            //     {
            //         const appRuntime = <LogicAppRuntime>app.runtime;
            //         appRuntime.exposedWithIngress = true;
    
            //         item.link(LogicLinkKind.app, app);

            //         helpers.logic.createIngress(app, item);
            //     }
            // }
            // else
            // {
            //     item.raiseAlert(ValidatorID.MISSING_INGRESS_SERVICE, `Service ${serviceName} is missing.`);
            // }
        }

    })
    ;
