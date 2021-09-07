import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
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
