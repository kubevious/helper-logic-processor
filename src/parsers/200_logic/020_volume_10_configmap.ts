import _ from 'the-lodash';
import { LogicVolumeParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';

export default LogicVolumeParser()
    .handler(({ logger, item, config, helpers, runtime }) => {

        {
            const configMapConfig = config.configMap;
            if (configMapConfig)
            {
                if (configMapConfig.name)
                {
                    findAndProcessConfigMap(configMapConfig.name, configMapConfig.optional);
                }
            }
        }

        {
            const sources = config?.projected?.sources ?? [];
            for(const sourceConfig of sources)
            {
                const configMapConfig = sourceConfig.configMap;
                if (configMapConfig)
                {
                    if (configMapConfig.name)
                    {
                        findAndProcessConfigMap(configMapConfig.name, configMapConfig.optional);
                    }
                }
            }
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
            }
            else
            {
                if (!isOptional) {
                    item.raiseAlert(ValidatorID.MISSING_CONFIG_MAP, `Could not find ConfigMap ${name}`);
                }
            }
        }

    })
    ;
