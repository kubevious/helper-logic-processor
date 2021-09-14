import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';
import { LogicAppRuntime, PortInfo } from '../../types/parser/logic-app';

export default LogicContainerParser()
    .handler(({ logger, item, config, helpers}) => {

        if (!config.ports) {
            return;
        }

        const app = item.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;

        for(let portConfig of config.ports) {
            let portName = portConfig.protocol + "-" + portConfig.containerPort;
            if (portConfig.name) {
                portName = portConfig.name + " (" + portName + ")";
            }

            let portItem = item.fetchByNaming("port", portName);
            portItem.setConfig(portConfig);

            let portInfo : PortInfo = {
                name: portConfig.name,
                containerName: config.name,
                portDn: portItem.dn,
                containerDn: item.dn
            };

            appRuntime.ports[portConfig.containerPort] = portInfo;
            if (portConfig.name) {
                appRuntime.ports[portConfig.name] = portInfo;
            }
        }

    })
    ;
