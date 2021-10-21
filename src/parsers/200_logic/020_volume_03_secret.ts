import _ from 'the-lodash';
import { LogicVolumeParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicVolumeParser()
    .handler(({ logger, item, config, helpers, runtime }) => {

        if (!config.secret) {
            return;
        }

        if (config.secret.secretName) {
            findAndProcessSecret(config.secret.secretName, config.secret.optional)
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
                        linkName: 'k8s-owner',
                        skipUsageRegistration: true
                    })
            }
            else
            {
                if (!isOptional) {
                    item.addAlert("MissingSecret", "error", `Could not find Secret ${name}`);
                }
            }
        }


    })
    ;
