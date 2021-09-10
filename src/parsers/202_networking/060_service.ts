import { Service } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';

export default K8sParser<Service>()
    .target({
        kind: "Service"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        if (config.spec!.type == 'ClusterIP' || 
            config.spec!.type == 'NodePort' ||
            config.spec!.type == 'LoadBalancer')
        {
            const targetApps = helpers.k8s.labelMatcher.matchSelector(
                'LogicApp',
                namespace,
                { matchLabels: config.spec!.selector! });
            
            for(let targetApp of targetApps)
            {
                item.link('app', targetApp);

                const appRuntime = <LogicAppRuntime>targetApp.runtime;
                appRuntime.exposedWithService = true;

                const logicSvc = targetApp.fetchByNaming('service', metadata.name);
                logicSvc.makeShadowOf(item);
                item.link('logic', logicSvc);
            }
        }

    })
    ;
