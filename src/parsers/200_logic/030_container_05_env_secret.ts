import { Secret } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';

export default LogicContainerParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        if (!config.envFrom) {
            return;
        }

        for(const envFromObj of config.envFrom) {
            const secretRef = envFromObj.secretRef;
            if (secretRef)
            {
                const secretName = secretRef.name;
                if (secretName) {
                    const secret = findAndProcessSecret(secretName);
                    if (secret) {
                        if (secret.data) {
                            for(const dataKey of _.keys(secret.data)) {
                                const dataValue = secret.data[dataKey];
                                const envName = envFromObj.prefix ? `${envFromObj.prefix}${dataKey}` : dataKey;
                                runtime.envVars[envName] = dataValue ?? null;
                            }
                        } else {
                            item.raiseAlert(ValidatorID.EMPTY_SECRET, `Secret has no data: ${secretName}`);
                        }
                    } else {
                        if (!secretRef.optional) {
                            item.raiseAlert(ValidatorID.MISSING_SECRET, `Could not find Secret ${secretName}`);
                        }
                    }
                }
            }
        }

        /*** HELPERS **/
        
        function findAndProcessSecret(name: string) : Secret | null
        {
            const k8sSecret = helpers.k8s.findItem(runtime.namespace, 'v1', 'Secret', name);

            if (k8sSecret)
            {
                helpers.shadow.create(k8sSecret, item, 
                    {
                        kind: NodeKind.secret,
                        linkName: 'k8s',
                        inverseLinkName: 'env',
                        inverseLinkPath: `${runtime.app}-${item.naming}`,
                    })

                return <Secret>k8sSecret.config;
            }
            
            return null;
        }
        
    })
    ;
