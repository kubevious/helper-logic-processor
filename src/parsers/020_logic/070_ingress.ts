import { Ingress, IngressBackend } from 'kubernetes-types/networking/v1';
import _ from 'the-lodash';
import { LogicItem } from '../..';
import { K8sParser } from '../../parser-builder';

export default K8sParser<Ingress>()
    .only()
    .target({
        api: "networking.k8s.io",
        kind: "Ingress"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        logger.error("NEW INGRESS>> %s", item.id);

        if (config.spec)
        {
            if (config.spec.defaultBackend) {
                processIngressBackend(config.spec.defaultBackend);
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
            if (!backend.service) {
                return 
            }

            const serviceDn = helpers.k8s.makeDn(namespace!, 'v1', 'Service', backend.service.name);
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
            while(parent.findByNaming('ingress', name))
            {
                name = name + '_';
            }

            let ingress = parent.fetchByNaming('ingress', name);
            return ingress;
        }
    })
    ;
