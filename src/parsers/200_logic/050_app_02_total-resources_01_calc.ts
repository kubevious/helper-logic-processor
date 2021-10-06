import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic'
import { InfraNodesRuntime } from '../../types/parser/infra-nodes';

export default LogicAppParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        let multiplier = 0;
        if (runtime.launcherKind == 'Deployment' || 
        runtime.launcherKind == 'StatefulSet')
        {
            multiplier = runtime.launcherReplicas || 0;
        }
        else if (runtime.launcherKind == 'DaemonSet')
        {
            const nodes = scope.findItem('root/infra/nodes')!;
            multiplier = (<InfraNodesRuntime>nodes.runtime).nodeCount;
        }
        
        runtime.usedResources = {};

        for(let metric of helpers.resources.METRICS)
        {
            const perPod = runtime.perPodResources[metric];
            runtime.usedResources[metric] = { 
                value: perPod.value * multiplier,
                unit: perPod.unit
            };
        }


    })
    ;
