import { Ingress, IngressBackend, HTTPIngressPath, IngressRule } from 'kubernetes-types/networking/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

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

        if (item.resolveTargetLinks(LogicLinkKind.app).length == 0)
        {
            item.raiseAlert(ValidatorID.INGRESS_NOT_MOUNT_TO_APPS, 'Could not match Ingress to Services.')
        }


        /*** HELPERS ***/

        function processIngressBackend(backend: IngressBackend, pathConfig: HTTPIngressPath | undefined, ruleConfig: IngressRule | undefined)
        {
            const domainName = ruleConfig?.host;
            const urlPath = pathConfig?.path ?? '*';
            const gIngress = helpers.gateway.createIngress(domainName, urlPath, item);

            const service = backend?.service;

            helpers.gateway.findAndMountService(
                item,
                gIngress,
                namespace!,
                service?.name,
                service?.port ?? {});
        }

    })
    ;
