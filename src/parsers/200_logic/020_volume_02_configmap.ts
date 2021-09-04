import _ from 'the-lodash';
import { ConfigMap, Volume } from 'kubernetes-types/core/v1'

import { LogicParser } from '../../parser-builder';
import { LogicVolumeRuntime } from '../../types/parser/logic-volume';

export default LogicParser<Volume, LogicVolumeRuntime>()
    .target({
        path: ["logic", "ns", "app", "vols", "vol"]
    })
    .handler(({ logger, item, config, helpers, runtime }) => {

        if (!config.configMap) {
            return;
        }

        if (config.configMap.name) {
            findAndProcessConfigMap(config.configMap.name, config.configMap.optional)
        }

        /*** HELPERS **/

        function findAndProcessConfigMap(name: string, isOptional?: boolean) : ConfigMap | null
        {
            const k8sConfigMapDn = helpers.k8s.makeDn(runtime.namespace, 'v1', 'ConfigMap', name);

            let logicConfigMap = item.fetchByNaming("configmap", name);
            const k8sConfigMap = logicConfigMap.link('k8s-owner', k8sConfigMapDn);
            if (k8sConfigMap)
            {
                logicConfigMap.makeShadowOf(k8sConfigMap);
                return <ConfigMap>k8sConfigMap.config;
            }
            else
            {
                if (!isOptional) {
                    // createAlert("MissingConfig", "error", 'Could not find ConfigMap ' + name);
                }
            }

            return null;
        }

    })
    ;