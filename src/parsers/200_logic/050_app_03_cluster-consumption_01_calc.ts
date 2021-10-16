import _ from 'the-lodash';
import { PropertyValueWithUnit } from '../../helpers/resources';
import { LogicAppParser } from '../../parser-builder/logic'
import { InfraNodesRuntime } from '../../types/parser/infra-nodes';

export default LogicAppParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        const nodes = scope.findItem('root/infra/nodes')!;
        const nodesRuntime = <InfraNodesRuntime>nodes.runtime;

        const myUsedResources : Record<string, PropertyValueWithUnit> = {};
        let availableResources : Record<string, PropertyValueWithUnit> | null = null;

        if (runtime.launcherKind == 'Deployment' || 
            runtime.launcherKind == 'StatefulSet')
        {
            for(const metric of helpers.resources.METRICS)
            {
                myUsedResources[metric] = runtime.usedResources[metric];
            }
            availableResources = nodesRuntime.resourcesAllocatable;
        }
        else if (runtime.launcherKind == 'DaemonSet')
        {
            for(const metric of helpers.resources.METRICS)
            {
                myUsedResources[metric] = runtime.perPodResources[metric];
            }
            availableResources = nodesRuntime.nodeResources;
        }

        runtime.clusterConsumption = {};

        if (!availableResources)
        {
            return;
        }

        for(const metric of helpers.resources.METRICS)
        {
            const usedValue = myUsedResources[metric]?.value ?? 0;
            const availValue = availableResources[metric]?.value;

            let consumption: number;
            if (!availValue) {
                consumption = 0;
            } else {
                consumption = usedValue / availValue;
            }
            runtime.clusterConsumption[metric] = {
                value: consumption,
                unit: '%'
            }
            ;
        }

    })
    ;
