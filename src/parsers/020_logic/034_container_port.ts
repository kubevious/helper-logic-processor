import { Container } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';

export default LogicParser<Container>()
    .only()
    .target({
        path: ["logic", "ns", "app", "cont"]
    })
    .target({
        path: ["logic", "ns", "app", "initcont"]
    })
    .handler(({ logger, item, config, helpers}) => {

        if (!config.ports) {
            return;
        }

        for(let portConfig of config.ports) {
            let portName = portConfig.protocol + "-" + portConfig.containerPort;
            if (portConfig.name) {
                portName = portConfig.name + " (" + portName + ")";
            }

            let portItem = item.fetchByNaming("port", portName);
            portItem.setConfig(portConfig);

            // let portConfigScope = {
            //     name: portConfig.name,
            //     containerName: containerConfig.name,
            //     portItem: portItem,
            //     containerItem: container
            // };

            // appScope.ports[portConfig.name] = portConfigScope;
            // appScope.ports[portConfig.containerPort] = portConfigScope;
        }

    })
    ;
