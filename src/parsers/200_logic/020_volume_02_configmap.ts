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

        function findAndProcessConfigMap(name: string, isOptional?: boolean) : ConfigMap | null
        {
            const k8sConfigMapDn = helpers.k8s.makeDn(runtime.namespace, 'v1', 'ConfigMap', name);

            const logicConfigMap = item.fetchByNaming(NodeKind.configmap, name);
            const k8sConfigMap = logicConfigMap.link('k8s-owner', k8sConfigMapDn);
            if (k8sConfigMap)
            {
                logicConfigMap.makeShadowOf(k8sConfigMap);
                return <ConfigMap>k8sConfigMap.config;
            }
            else
            {
                if (!isOptional) {
                    item.addAlert("MissingConfig", "error", `Could not find ConfigMap ${name}`);
                }
            }

            return null;
        }

    })
    ;
