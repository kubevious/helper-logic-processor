import { Ingress, IngressBackend, HTTPIngressPath, IngressRule } from 'kubernetes-types/networking/v1';
import _ from 'the-lodash';
import { LogicItem } from '../..';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';

export default K8sParser<Ingress>()
    .target({
        api: "networking.k8s.io",
        kind: "Ingress"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        if (!config.spec) {
            return;
        }
        
        if (config.spec.defaultBackend) {
            processIngressBackend(config.spec.defaultBackend, undefined, undefined);
        }

        const rules = config.spec.rules ?? [];
        for(const ruleConfig of rules)
        {
            if (ruleConfig.http && ruleConfig.http.paths)
            {
                for(const pathConfig of ruleConfig.http.paths)
                
                {
                    if (pathConfig.backend)
                    {
                        processIngressBackend(pathConfig.backend, pathConfig, ruleConfig);
                    }
                }
            }
        }

        if (item.resolveTargetLinks('app').length == 0)
        {
            item.addAlert('Missing', 'error', 'Could not match Ingress to Services.')
        }


        /*** HELPERS ***/

        function processIngressBackend(backend: IngressBackend, pathConfig: HTTPIngressPath | undefined, ruleConfig: IngressRule | undefined)
        {
            const service = backend?.service;
            if (!service) {
                return 
            }

            const serviceDn = helpers.k8s.makeDn(namespace!, 'v1', 'Service', service.name);
            const serviceItem = item.link('service', serviceDn);
            if (serviceItem)
            {
                {
                    const app = serviceItem.resolveTargetLinkItem('app');
                    if (app)
                    {
                        const appRuntime = <LogicAppRuntime>app.runtime;
                        appRuntime.exposedWithIngress = true;
        
                        item.link('app', app);
                        createIngress(app);
                    }
                }

                {
                    const domainName = ruleConfig?.host;
                    const urlPath = pathConfig?.path ?? '*';
                    helpers.gateway.getRule(domainName, urlPath, item, pathConfig);
                }
            }
            else
            {
                item.addAlert('MissingSvc', 'error', `Service ${service.name} is missing.`);
            }
        }

        function createIngress(parent : LogicItem)
        {
            let name = metadata.name!;
            while(parent.findByNaming('ingress', name))
            {
                name = name + '_';
            }

            const ingress = parent.fetchByNaming(NodeKind.ingress, name);
            ingress.makeShadowOf(item);
            return ingress;
        }
    })
    ;
