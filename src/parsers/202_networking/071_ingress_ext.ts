import { HTTPIngressPath, Ingress, IngressBackend, IngressRule } from 'kubernetes-types/extensions/v1beta1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';
import { ServiceBackendPort } from 'kubernetes-types/networking/v1';

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
            processIngressBackend(config.spec.backend, undefined, undefined);
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

        if (item.resolveTargetLinks(LogicLinkKind.app).length == 0)
        {
            item.raiseAlert(ValidatorID.INGRESS_NOT_MOUNT_TO_APPS, 'Could not match Ingress to Services.')
        }

        /*** HELPERS ***/

        function processIngressBackend(backend: IngressBackend, pathConfig: HTTPIngressPath | undefined, ruleConfig: IngressRule | undefined)
        {
            const domainName = ruleConfig?.host;
            const urlPath = pathConfig?.path ?? '*';

            const serviceName = backend?.serviceName;
            if (!serviceName) {
                helpers.gateway.setupIngress(domainName, urlPath, item, null);
                return 
            }

            const serviceDn = helpers.k8s.makeDn(namespace!, 'v1', 'Service', serviceName);
            const k8sServiceItem = item.link(LogicLinkKind.service, serviceDn);

            const servicePort: ServiceBackendPort = {}
            
            if (_.isNumber(backend?.servicePort)) {
                servicePort.number = backend?.servicePort;
            }
            else if (_.isString(backend?.servicePort)) {
                servicePort.name = backend?.servicePort;
            }

            helpers.gateway.setupIngress(domainName, urlPath, item, k8sServiceItem, servicePort);

            if (k8sServiceItem)
            {
                const app = k8sServiceItem.resolveTargetLinkItem(LogicLinkKind.app);
                if (app)
                {
                    const appRuntime = <LogicAppRuntime>app.runtime;
                    appRuntime.exposedWithIngress = true;

                    item.link(LogicLinkKind.app, app);

                    helpers.logic.createIngress(app, item);
                }
            }
            else
            {
                item.raiseAlert(ValidatorID.MISSING_INGRESS_SERVICE, `Service ${serviceName} is missing.`);
            }
        }
        
    })
    ;
