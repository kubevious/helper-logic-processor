import _ from 'the-lodash';
import { DaemonSet, Deployment, StatefulSet } from 'kubernetes-types/apps/v1';
import { Job } from 'kubernetes-types/batch/v1';

import { LogicParser } from '../../parser-builder';

import { Container } from 'kubernetes-types/core/v1'


export default LogicParser<Deployment | DaemonSet | StatefulSet | Job>()
    .only()
    .target({
        path: ["logic", "ns", "app", "launcher"]
    })
    .handler(({ logger, item, config, helpers}) => {

        // const config = helpers.k8s.config(item);
        if (!config.spec) {
            return;
        }
        if (! config.spec.template.spec) {
            return;
        }
        
        // Normal Containers 
        {
            for(let containerConfig of config.spec.template.spec.containers)
            {
                processContainer(containerConfig, "cont");
            }
        }

        // Init Containers 
        {
    
            const initContainers = config.spec.template.spec.initContainers;
            if (initContainers) {
                for(let containerConfig of initContainers)
                {
                    processContainer(containerConfig, "initcont");
                }
            }
        }


        /** HELPERS **/

        function processContainer(containerConfig: Container, kind : string)
        {
            const cont = item.parent!.fetchByNaming(kind, containerConfig.name);
            cont.setConfig(containerConfig);

            // let envVars : Record<string, any> = {
            // }

            // if (containerConfig.env) {
            //     for(let envObj of containerConfig.env) {
            //         let value = null;
            //         if (envObj.value) {
            //             value = envObj.value;
            //         } else if (envObj.valueFrom) {
            //             value = "<pre>" + yaml.dump(envObj.valueFrom) + "</pre>";
            //         }
            //         envVars[envObj.name] = value;
            //     }
            // }

            // if (containerConfig.envFrom) {
            //     for(let envFromObj of containerConfig.envFrom) {
            //         if (envFromObj.configMapRef) {
            //             let configMapScope = findAndProcessConfigMap(container, envFromObj.configMapRef.name, true);
            //             if (configMapScope) {
            //                 if (configMapScope.config.data) {
            //                     for(let dataKey of _.keys(configMapScope.config.data)) {
            //                         envVars[dataKey] = configMapScope.config.data[dataKey];
            //                     }
            //                 } else {
            //                     createAlert("EmptyConfig", "warn", 'ConfigMap has no data: ' + envFromObj.configMapRef.name);
            //                 }
            //             }
            //         }
            //     }
            // }


            // if (_.keys(envVars).length > 0) {
            //     container.addProperties({
            //         kind: "key-value",
            //         id: "env",
            //         title: "Environment Variables",
            //         order: 10,
            //         config: envVars
            //     });    
            // }

           
        }

    })
    ;
