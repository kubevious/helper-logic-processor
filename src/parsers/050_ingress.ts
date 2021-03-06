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

        var defaultBackend = _.get(item.config, "spec.backend");
        if (defaultBackend) {
            processIngressBackend(defaultBackend);
        }

        var rulesConfig = _.get(item.config, "spec.rules");
        for(var ruleConfig of rulesConfig)
        {
            var host = ruleConfig.host;
            if (!host) {
                host = null;
            }
            if (ruleConfig.http && ruleConfig.http.paths) {
                for(var pathConfig of ruleConfig.http.paths) {
                    if (pathConfig.backend) {
                        processIngressBackend(pathConfig.backend);
                    }
                }
            }
        }

        if (!hasCreatedItems()) {
            var rawContainer = scope.fetchRawContainer(item, "Ingresses");
            createIngress(rawContainer);
            createAlert('Missing', 'error', 'Could not match Ingress to Services.');
        }

        /*** HELPERS ***/
        function processIngressBackend(backendConfig: any)
        {
            if (!backendConfig.serviceName) {
                return;
            }

            var serviceScopeInfo = namespaceScope.items.get('Service', backendConfig.serviceName);
            if (serviceScopeInfo) {

                for(var appScope of serviceScopeInfo.appScopes)
                {
                    appScope.properties['Exposed'] = 'With Ingress';
                }

                for(var serviceItem of serviceScopeInfo.items) {
                    createIngress(serviceItem);
                }

                for(var appItem of serviceScopeInfo.appItems)
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
            var k8sIngress = createK8sItem(parent, params);
            return k8sIngress;
        }
    })
    ;
    