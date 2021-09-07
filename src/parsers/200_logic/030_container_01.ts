import _ from 'the-lodash';

import { Container } from 'kubernetes-types/core/v1'
import { LogicContainerRuntime } from '../../types/parser/logic-container';
import { LogicLauncherParser } from '../../parser-builder/logic';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime}) => {

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
            (<LogicContainerRuntime>cont.runtime).namespace = runtime.namespace;
            cont.setConfig(containerConfig);
            
            cont.addProperties({
                kind: "yaml",
                id: "config",
                title: "Config",
                order: 10,
                config: containerConfig
            });
        }

    })
    ;
