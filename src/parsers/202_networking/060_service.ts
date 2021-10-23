import { Service } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicItem } from '../..';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';

export default K8sParser<Service>()
    .target({
        kind: "Service"
    })
    .handler(({ logger, config, scope, item, metadata, namespace, helpers }) => {

        if (config.spec!.type == 'ClusterIP' || 
            config.spec!.type == 'NodePort' ||
            config.spec!.type == 'LoadBalancer')
        {
            const targetApps = helpers.k8s.labelMatcher.matchSelector(
                'LogicApp',
                namespace,
                { matchLabels: config.spec!.selector! });
            
            for(const targetApp of targetApps)
            {
                processTargetApp(targetApp);
            }

            if (targetApps.length == 0) {
                item.addAlert('MissingApp', 'error', 'Could not find apps matching selector.');
            } else if (targetApps.length > 1) {
                item.addAlert('MultipleApps', 'warn', 'More than one apps matched selector.');
            }
        }

        /*** HELPERS ***/
        function processTargetApp(targetApp: LogicItem)
        {
            item.link('app', targetApp);

            const appRuntime = <LogicAppRuntime>targetApp.runtime;
            appRuntime.exposedWithService = true;

            helpers.shadow.create(item, targetApp,
                {
                    kind: NodeKind.service,
                    linkName: 'k8s',
                    inverseLinkName: 'logic',
                    inverseLinkPath: targetApp.naming
                });

            const portConfigs = config.spec?.ports ?? [];
            for(const portConfig of portConfigs)
            {
                if (portConfig.targetPort)
                {
                    const appPortInfo = appRuntime.ports[portConfig.targetPort];
                    if (appPortInfo)
                    {
                        const portItem = scope.findItem(appPortInfo.portDn)!;
                        portItem.link('service', item, metadata.name);
                    }
                    else
                    {
                        item.addAlert('MissingPort', 'warn', `Missing port ${portConfig.targetPort} definition.`);
                    }
                }
                
            }
            
        }

    })
    ;
