import _ from 'the-lodash';
import { LogicItem } from '../item';
import { ConcreteParser } from '../parser-builder';

export default ConcreteParser()
    .order(50)
    .target({
        api: "extensions",
        kind: "Ingress"
    })
    .kind('ingress')
    .needNamespaceScope(true)
    .handler(({ scope, item, createK8sItem, createAlert, hasCreatedItems, namespaceScope }) => {
        namespaceScope.items.register(item.config);

        let defaultBackend = _.get(item.config, "spec.backend");
        if (defaultBackend) {
            processIngressBackend(defaultBackend);
        }

        let rulesConfig = _.get(item.config, "spec.rules");
        for(let ruleConfig of rulesConfig)
        {
            let host = ruleConfig.host;
            if (!host) {
                host = null;
            }
            if (ruleConfig.http && ruleConfig.http.paths) {
                for(let pathConfig of ruleConfig.http.paths) {
                    if (pathConfig.backend) {
                        processIngressBackend(pathConfig.backend);
                    }
                }
            }
        }

        if (!hasCreatedItems()) {
            let rawContainer = scope.fetchRawContainer(item, "Ingresses");
            createIngress(rawContainer);
            createAlert('Missing', 'error', 'Could not match Ingress to Services.');
        }

        /*** HELPERS ***/
        function processIngressBackend(backendConfig: any)
        {
            if (!backendConfig.serviceName) {
                return;
            }

            let serviceScopeInfo = namespaceScope.items.get('Service', backendConfig.serviceName);
            if (serviceScopeInfo) {

                for(let appScope of serviceScopeInfo.appScopes)
                {
                    appScope.properties['Exposed'] = 'With Ingress';
                }

                for(let serviceItem of serviceScopeInfo.items) {
                    createIngress(serviceItem);
                }

                for(let appItem of serviceScopeInfo.appItems)
                {
                    createIngress(appItem, { order: 250 });
                }
            }
            else
            {
                createAlert('MissingSvc-' + backendConfig.serviceName, 'error', 'Service ' + backendConfig.serviceName + ' is missing.');
            }
        }

        function createIngress(parent : LogicItem, params?: any)
        {
            let k8sIngress = createK8sItem(parent, params);
            return k8sIngress;
        }
    })
    ;
    