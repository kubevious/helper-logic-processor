import _ from 'the-lodash';

import { Container } from 'kubernetes-types/core/v1'
import { LogicContainerRuntime } from '../../types/parser/logic-container';
import { LogicLauncherParser } from '../../parser-builder/logic';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicLauncherParser()
    .handler(({ logger, item, runtime}) => {

        if (!runtime.podTemplateSpec?.spec) {
            return;
        }

        const app = item.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;
        
        // Normal Containers 
        {
            const containers = runtime.podTemplateSpec?.spec.containers;
            appRuntime.containerCount = containers.length;
            for(const containerConfig of containers)
            {
                processContainer(containerConfig, NodeKind.cont);
            }
        }

        // Init Containers 
        {
            const initContainers = runtime.podTemplateSpec?.spec.initContainers ?? [];
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
            (<LogicContainerRuntime>cont.runtime).app = app.naming;
            cont.setConfig(containerConfig);
            
            cont.addProperties({
                kind: PropsKind.yaml,
                id: PropsId.config,
                config: containerConfig
            });
        }

    })
    ;
