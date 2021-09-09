import _ from 'the-lodash';
import { InfraNodesParser } from '../../parser-builder/infra';
import { InfraPoolRuntime } from '../../types/parser/infra-pool';

export default InfraNodesParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        runtime.clusterResources = {};
        runtime.nodeResources = {};

        for(let metric of helpers.resources.METRICS) {
            for(let counterType of helpers.resources.COUNTER_TYPES)
            {
                runtime.clusterResources[helpers.resources.makeMetricProp(metric, counterType)] = { 
                    value: 0,
                    unit: helpers.resources.METRIC_UNITS[metric]
                };
            }
        }

        for(let pool of item.getChildrenByKind('pool'))
        {
            const poolRuntime = (<InfraPoolRuntime>pool.runtime);
            runtime.poolCount ++;
            runtime.nodeCount += poolRuntime.nodeCount;

            for(let metric of helpers.resources.METRICS)
            {
                for(let counterType of helpers.resources.COUNTER_TYPES)
                {
                    let value = poolRuntime.poolResources[helpers.resources.makeMetricProp(metric, counterType)]
                    if (value) {
                        runtime.clusterResources[helpers.resources.makeMetricProp(metric, counterType)].value += value.value;
                    }
                }

                {
                    let value = poolRuntime.nodeResources[metric];
                    if (value)
                    {
                        const currPerNodeMetric = runtime.nodeResources[metric];
                        if (currPerNodeMetric)
                        {
                            runtime.nodeResources[metric] = {
                                value: Math.min(currPerNodeMetric.value, value.value),
                                unit: currPerNodeMetric.unit
                            };
                        }
                        else
                        {
                            runtime.nodeResources[metric] = value;
                        }
                    }
                }
            }
        }

        for(let metric of helpers.resources.METRICS)
        {
            if (!runtime.nodeResources[metric])
            {
                runtime.nodeResources[metric] = {
                    value: 0,
                    unit: helpers.resources.METRIC_UNITS[metric]
                }
            }
        }

        item.addProperties({
            kind: "key-value",
            id: "cluster-resources",
            title: "Cluster Resources",
            order: 7,
            config: runtime.clusterResources
        });

        item.addProperties({
            kind: "key-value",
            id: "node-resources",
            title: "Node Resources",
            order: 8,
            config: runtime.nodeResources
        });

    })
    ;

