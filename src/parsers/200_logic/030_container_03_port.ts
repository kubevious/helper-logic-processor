import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';
import { LogicAppRuntime, PortInfo } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicContainerParser()
    .handler(({ logger, item, config, helpers}) => {

        if (!config.ports) {
            return;
        }

        const app = item.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;

        for(const portConfig of config.ports) {
            const protocol = portConfig.protocol || 'TCP';
            let portName = `${protocol}-${portConfig.containerPort}`;
            if (portConfig.name) {
                portName = `${portConfig.name}  (${portName})`;
            }

            const portItem = item.fetchByNaming(NodeKind.port, portName);
            portItem.setConfig(portConfig);

            portItem.addProperties({
                kind: PropsKind.yaml,
                id: PropsId.config,
                config: portConfig
            });

            const portInfo : PortInfo = {
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
