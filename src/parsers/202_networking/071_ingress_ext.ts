import { Ingress, IngressBackend } from 'kubernetes-types/extensions/v1beta1';
import _ from 'the-lodash';
import { LogicItem } from '../..';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';

export default K8sParser<Ingress>()
    .target({
        api: "extensions",
        kind: "Ingress"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        if (!config.spec) {
            return;
        }
        
        if (config.spec.backend) {
            processIngressBackend(config.spec.backend);
        }

        const rules = config.spec.rules ?? [];
        for(const ruleConfig of rules)
        {
            if (ruleConfig.http && ruleConfig.http.paths) {
                for(const pathConfig of ruleConfig.http.paths) {
                    if (pathConfig.backend) {
                        processIngressBackend(pathConfig.backend);
                    }
                }
            }
        }

        if (item.resolveTargetLinks('app').length == 0)
        {
            item.addAlert('Missing', 'error', 'Could not match Ingress to Services.')
        }

        /*** HELPERS ***/

        function processIngressBackend(backend: IngressBackend)
        {
            if (!backend.serviceName) {
                return 
            }

            const serviceDn = helpers.k8s.makeDn(namespace!, 'v1', 'Service', backend.serviceName);
            const serviceItem = item.link('k8s-owner', serviceDn);
            if (serviceItem)
            {
                {
                    const logicService = serviceItem.resolveTargetLinkItem('logic');
                    if (logicService)
                    {
                        const logicIngress = createIngress(logicService);
                        item.link('logic', logicIngress);
                    }
                }

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
            }
            else
            {
                item.addAlert('MissingSvc', 'error', `Service ${backend.serviceName} is missing.`);
            }
        }

        function createIngress(parent : LogicItem)
        {
            const name = metadata.name!;
            const ingress = parent.fetchByNaming(NodeKind.ingress, name);
            ingress.makeShadowOf(item);
            return ingress;
        }
        
    })
    ;
