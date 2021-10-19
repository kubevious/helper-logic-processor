import { Secret } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

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
                                const envName = `${envFromObj.prefix}${dataKey}`;
                                runtime.envVars[envName] = dataValue;
                            }
                        } else {
                            item.addAlert("EmptyConfig", "warn", `Secret has no data: ${secretName}`);
                        }
                    } else {
                        // if (!secretRef.optional) {
                        //     item.addAlert("MissingConfig", "error", `Could not find Secret ${secretName}`);
                        // }
                    }
                }
            }
        }

        /*** HELPERS **/
        
        function findAndProcessSecret(name: string) : Secret | null
        {
            const k8sSecretDn = helpers.k8s.makeDn(runtime.namespace, 'v1', 'Secret', name);

            const logicSecret = item.fetchByNaming(NodeKind.secret, name);
            const k8sSecret = logicSecret.link('k8s-owner', k8sSecretDn);
            if (k8sSecret)
            {
                logicSecret.makeShadowOf(k8sSecret);
                return <Secret>k8sSecret.config;
            }

            return null;
        }
        
    })
    ;
