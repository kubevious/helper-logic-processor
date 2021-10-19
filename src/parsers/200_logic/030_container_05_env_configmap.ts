import { ConfigMap } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicContainerParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        if (!config.envFrom) {
            return;
        }

        for(const envFromObj of config.envFrom) {
            const configMapRef = envFromObj.configMapRef;
            if (configMapRef)
            {
                const configMapName = configMapRef.name;
                if (configMapName) {
                    const configMap = findAndProcessConfigMap(configMapName);
                    if (configMap) {
                        if (configMap.data) {
                            for(const dataKey of _.keys(configMap.data)) {
                                const dataValue = configMap.data[dataKey];
                                const envName = envFromObj.prefix ? `${envFromObj.prefix}${dataKey}` : dataKey;
                                runtime.envVars[envName] = dataValue ?? null;
                            }
                        } else {
                            item.addAlert("EmptyConfig", "warn", `ConfigMap has no data: ${configMapName}`);
                        }
                    } else {
                        if (!configMapRef.optional) {
                            item.addAlert("MissingConfig", "error", `Could not find ConfigMap ${configMapName}`);
                        }
                    }
                }
            }
        }

        /*** HELPERS **/
        
        function findAndProcessConfigMap(name: string) : ConfigMap | null
        {
            const k8sConfigMapDn = helpers.k8s.makeDn(runtime.namespace, 'v1', 'ConfigMap', name);

            const logicConfigMap = item.fetchByNaming(NodeKind.configmap, name);
            const k8sConfigMap = logicConfigMap.link('k8s-owner', k8sConfigMapDn);
            if (k8sConfigMap)
            {
                helpers.usage.register(logicConfigMap, k8sConfigMap);
                logicConfigMap.makeShadowOf(k8sConfigMap);
                return <ConfigMap>k8sConfigMap.config;
            }

            return null;
        }
        
    })
    ;
