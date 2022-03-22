import { ConfigMap } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default LogicContainerParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        if (!config.envFrom) {
            return;
        }

        // TODO: prefix
        // TODO: handle env.valueFrom

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
                            item.raiseAlert(ValidatorID.EMPTY_ENV_CONFIG_MAP, `ConfigMap has no data: ${configMapName}`);
                        }
                    } else {
                        if (!configMapRef.optional) {
                            item.raiseAlert(ValidatorID.MISSING_ENV_CONFIG_MAP, `Could not find ConfigMap ${configMapName}`);
                        }
                    }
                }
            }
        }

        /*** HELPERS **/
        
        function findAndProcessConfigMap(name: string) : ConfigMap | null
        {
            const k8sConfigMap = helpers.k8s.findItem(runtime.namespace, 'v1', 'ConfigMap', name);

            if (k8sConfigMap)
            {
                helpers.shadow.create(k8sConfigMap, item, 
                    {
                        kind: NodeKind.configmap,
                        linkName: LogicLinkKind.k8s,
                        inverseLinkName: LogicLinkKind.env,
                        inverseLinkPath: `${runtime.app}-${item.naming}`,
                    })

                return <ConfigMap>k8sConfigMap.config;
            }
            
            return null;
        }
        
    })
    ;
