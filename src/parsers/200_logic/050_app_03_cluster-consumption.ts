import _ from 'the-lodash';
import { PropertyValueWithUnit } from '../../helpers/resources';
import { LogicAppParser } from '../../parser-builder/logic'
import { InfraNodesRuntime } from '../../types/parser/infra-nodes';

export default LogicAppParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        const nodes = scope.findItem('root/infra/nodes')!;
        const nodesRuntime = <InfraNodesRuntime>nodes.runtime;

        let myUsedResources : Record<string, PropertyValueWithUnit> = {};
        let availableResources : Record<string, PropertyValueWithUnit> | null = null;

        if (runtime.launcherKind == 'Deployment' || 
            runtime.launcherKind == 'StatefulSet')
        {
            for(let metric of helpers.resources.METRICS)
            {
                myUsedResources[metric] = runtime.usedResources[helpers.resources.makeMetricProp(metric, 'request')];
            }
            availableResources = nodesRuntime.clusterResources;
        }
        else if (runtime.launcherKind == 'DaemonSet')
        {
            for(let metric of helpers.resources.METRICS)
            {
                myUsedResources[metric] = runtime.perPodResources[helpers.resources.makeMetricProp(metric, 'request')];
            }
            availableResources = nodesRuntime.nodeResources;
        }

        if (!availableResources)
        {
            return;
        }

        let clusterConsumptionProps : Record<string, PropertyValueWithUnit> = {};
        for(let metric of _.keys(myUsedResources))
        {
            let usedValue = myUsedResources[metric];
            let availValue = availableResources[helpers.resources.makeMetricProp(metric, 'allocatable')];
            let consumption: number;
            if (!availValue) {
                consumption = 0;
            } else {
                consumption = usedValue.value / availValue.value;
            }
            clusterConsumptionProps[metric] = {
                value: consumption,
                unit: '%'
            }
            ;
        }

        item.addProperties({
            kind: "key-value",
            id: "cluster-consumption",
            title: "Cluster Consumption",
            order: 9,
            config: clusterConsumptionProps
        });

    })
    ;
