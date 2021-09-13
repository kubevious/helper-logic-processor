import { ConfigMap } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        if (!config.envFrom) {
            return;
        }

        for(let envFromObj of config.envFrom) {
            const configMapName = envFromObj.configMapRef?.name;
            if (configMapName) {
                let configMap = findAndProcessConfigMap(configMapName, envFromObj.configMapRef?.optional ?? false);
                if (configMap) {
                    if (configMap.data) {
                        for(let dataKey of _.keys(configMap.data)) {
                            const dataValue = configMap.data[dataKey];
                            runtime.envVars[dataValue] = dataValue;
                        }
                    } else {
                        item.addAlert("EmptyConfig", "warn", `ConfigMap has no data: ${configMapName}`);
                    }
                } else {
                    if (!envFromObj.configMapRef?.optional) {
                        item.addAlert("MissingConfig", "error", `Could not find ConfigMap ${configMapName}`);
                    }
                }
            }
        }

        /*** HELPERS **/
        
        function findAndProcessConfigMap(name: string, isOptional: boolean) : ConfigMap | null
        {
            const k8sConfigMapDn = helpers.k8s.makeDn(runtime.namespace, 'v1', 'ConfigMap', name);

            let logicConfigMap = item.fetchByNaming("configmap", name);
            const k8sConfigMap = logicConfigMap.link('k8s-owner', k8sConfigMapDn);
            if (k8sConfigMap)
            {
                logicConfigMap.makeShadowOf(k8sConfigMap);
                return <ConfigMap>k8sConfigMap.config;
            }

            return null;
        }
        
    })
    ;
