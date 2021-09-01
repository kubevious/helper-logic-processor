import { Ingress, IngressBackend } from 'kubernetes-types/extensions/v1beta1';
import _ from 'the-lodash';
import { LogicItem } from '../..';
import { K8sParser } from '../../parser-builder';

export default K8sParser<Ingress>()
    .target({
        api: "extensions",
        kind: "Ingress"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        if (config.spec)
        {
            if (config.spec.backend) {
                processIngressBackend(config.spec.backend);
            }

            if (config.spec.rules)
            {
                for(let ruleConfig of config.spec.rules)
                {
                    if (ruleConfig.http && ruleConfig.http.paths) {
                        for(let pathConfig of ruleConfig.http.paths) {
                            if (pathConfig.backend) {
                                processIngressBackend(pathConfig.backend);
                            }
                        }
                    }
                }
            }
        }

        /*** HELPERS ***/

        function processIngressBackend(backend: IngressBackend)
        {
            if (!backend.serviceName) {
                return 
            }

            const serviceDn = helpers.k8s.makeDn(namespace!, 'v1', 'Service', backend.serviceName);
            item.link('k8s-owner', serviceDn);

            const serviceItem = item.resolveLink('k8s-owner');
            if (serviceItem)
            {
                {
                    const logicService = serviceItem.resolveLink('logic');
                    if (logicService)
                    {
                        const logicIngress = createIngress(logicService);
                        item.link('logic', logicIngress);
                    }
                }

                {
                    const app = serviceItem.resolveLink('app');
                    if (app)
                    {
                        item.link('app', app);
                        createIngress(app);
                    }
                }

                // for(let appScope of serviceScopeInfo.appScopes)
                // {
                //     appScope.properties['Exposed'] = 'With Ingress';
                // }
            }
            else
            {
                // createAlert('MissingSvc-' + backendConfig.serviceName, 'error', 'Service ' + backendConfig.serviceName + ' is missing.');
            }
        }

        function createIngress(parent : LogicItem)
        {
            let name = metadata.name!;
            let ingress = parent.fetchByNaming('ingress', name);
            ingress.makeShadowOf(item);
            return ingress;
        }
        
    })
    ;
