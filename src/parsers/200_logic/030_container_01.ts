import _ from 'the-lodash';

import { Container } from 'kubernetes-types/core/v1'
import { LogicContainerRuntime } from '../../types/parser/logic-container';
import { LogicLauncherParser } from '../../parser-builder/logic';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime}) => {

        if (!config.spec) {
            return;
        }
        if (! config.spec.template.spec) {
            return;
        }

        const app = item.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;
        
        // Normal Containers 
        {
            const containers = config.spec.template.spec.containers;
            appRuntime.containerCount = containers.length;
            for(const containerConfig of containers)
            {
                processContainer(containerConfig, NodeKind.cont);
            }
        }

        // Init Containers 
        {
            const initContainers = config.spec.template.spec.initContainers ?? [];
            appRuntime.initContainerCount = initContainers.length;
            for(const containerConfig of initContainers)
            {
                processContainer(containerConfig, NodeKind.initcont);
            }
        }


        /** HELPERS **/

        function processContainer(containerConfig: Container, kind : NodeKind)
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
