import _ from 'the-lodash';
import { LogicVolumeParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';

export default LogicVolumeParser()
    .handler(({ logger, item, config, helpers, runtime }) => {


        {
            const secretConfig = config.secret;
            if (secretConfig)
            {
                if (secretConfig.secretName)
                {
                    findAndProcessSecret(secretConfig.secretName, secretConfig.optional);
                }
            }
        }

        {
            const sources = config?.projected?.sources ?? [];
            for(const sourceConfig of sources)
            {
                const secretConfig = sourceConfig.secret;
                if (secretConfig)
                {
                    if (secretConfig.name)
                    {
                        findAndProcessSecret(secretConfig.name, secretConfig.optional);
                    }
                }
            }
        }


        /*** HELPERS **/

        function findAndProcessSecret(name: string, isOptional?: boolean) 
        {
            const k8sSecret = helpers.k8s.findItem(runtime.namespace, 'v1', 'Secret', name);
            if (k8sSecret)
            {
                helpers.shadow.create(k8sSecret, item, 
                    {
                        kind: NodeKind.secret,
                        linkName: 'k8s',
                        inverseLinkName: 'volume',
                        inverseLinkPath: `${runtime.app}-${item.naming}`,
                        skipUsageRegistration: true
                    })
            }
            else
            {
                if (!isOptional) {
                    item.raiseAlert(ValidatorID.MISSING_VOLUME_MOUNT_SECRET, `Could not find Secret ${name}`);
                }
            }
        }


    })
    ;
