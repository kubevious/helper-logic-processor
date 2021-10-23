import _ from 'the-lodash';
import { ConfigMap } from 'kubernetes-types/core/v1'
import { LogicVolumeParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicVolumeParser()
    .handler(({ logger, item, config, helpers, runtime }) => {

        if (!config.configMap) {
            return;
        }

        if (config.configMap.name) {
            findAndProcessConfigMap(config.configMap.name, config.configMap.optional)
        }

        /*** HELPERS **/

        function findAndProcessConfigMap(name: string, isOptional?: boolean)
        {
            const k8sConfigMap = helpers.k8s.findItem(runtime.namespace, 'v1', 'ConfigMap', name);

            if (k8sConfigMap)
            {
                helpers.shadow.create(k8sConfigMap, item, 
                    {
                        kind: NodeKind.configmap,
                        linkName: 'k8s',
                        inverseLinkName: 'volume',
                        inverseLinkPath: `${runtime.app}-${item.naming}`,
                        skipUsageRegistration: true
                    })

                return <ConfigMap>k8sConfigMap.config;
            }
            else
            {
                if (!isOptional) {
                    item.addAlert("MissingConfig", "error", `Could not find ConfigMap ${name}`);
                }
            }
        }

    })
    ;
