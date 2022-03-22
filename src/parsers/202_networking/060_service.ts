import _ from 'the-lodash';
import { LogicItem } from '../..';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { K8sServicePort, makePortId } from '../../types/parser/k8s-service';
import { NodeKind } from '@kubevious/entity-meta';
import { K8sServiceParser } from '../../parser-builder/k8s';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default K8sServiceParser()
    .handler(({ logger, config, scope, item, metadata, namespace, runtime, helpers }) => {

        runtime.portsByName = {};
        runtime.portsDict = {};

        if (config.spec!.type == 'ClusterIP' || 
            config.spec!.type == 'NodePort' ||
            config.spec!.type == 'LoadBalancer')
        {
            for(const portConfig of (config.spec?.ports ?? []))
            {
                const protocol = (portConfig.protocol ?? 'TCP').toUpperCase();
                const runtimePort : K8sServicePort = {
                    id: makePortId(portConfig.port, protocol),
                    port: portConfig.port,
                    protocol: protocol,
                    config: portConfig,
                    logicPorts: {}
                }

                const id = makePortId(runtimePort.port, runtimePort.protocol);

                runtime.portsDict[id] = runtimePort;
                if (portConfig.name) {
                    runtime.portsByName[portConfig.name] = runtimePort;
                }
            }

            const targetApps = helpers.k8s.labelMatcher.matchSelector(
                'LogicApp',
                namespace,
                { matchLabels: config.spec!.selector! });
            
            for(const targetApp of targetApps)
            {
                processTargetApp(targetApp);
            }

            if (targetApps.length == 0) {
                item.raiseAlert(ValidatorID.MISSING_SERVICE_APP, 'Could not find apps matching selector.');
            } else if (targetApps.length > 1) {
                item.raiseAlert(ValidatorID.SERVICE_MULTIPLE_APPS, 'More than one apps matched selector.');
            }
        }

        /*** HELPERS ***/
        function processTargetApp(targetApp: LogicItem)
        {
            item.link(LogicLinkKind.app, targetApp);

            const appRuntime = <LogicAppRuntime>targetApp.runtime;
            appRuntime.exposedWithService = true;

            const logicService = helpers.shadow.create(item, targetApp,
                {
                    kind: NodeKind.service,
                    linkName: LogicLinkKind.k8s,
                    inverseLinkName: LogicLinkKind.logic,
                    inverseLinkPath: targetApp.naming
                });

            for(const portConfig of _.values(runtime.portsDict))
            {
                processTargetPort(portConfig, logicService, appRuntime);
            }
        }

        function processTargetPort(portConfig: K8sServicePort, logicService: LogicItem, appRuntime: LogicAppRuntime)
        {
            const targetPort = portConfig.config.targetPort;
            if (!targetPort)
            {
                return;
            }

            const appPortInfo = appRuntime.ports[targetPort];
            if (appPortInfo)
            {
                const portItem = scope.findItem(appPortInfo.portDn)!;
                portItem.link(LogicLinkKind.service, logicService, metadata.name);
                logicService.link(LogicLinkKind.port, portItem, `${appRuntime.app}-${targetPort}`);

                portConfig.logicPorts[portItem.dn] = true;
            }
            else
            {
                logicService.raiseAlert(ValidatorID.SERVICE_MISSING_PORT, `Missing port ${targetPort} definition.`);
            }
        }

    })
    ;
