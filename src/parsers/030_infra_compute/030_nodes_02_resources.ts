import _ from 'the-lodash';
import { InfraNodesParser } from '../../parser-builder/infra';
import { InfraPoolRuntime } from '../../types/parser/infra-pool';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default InfraNodesParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        runtime.resourcesAllocatable = {};
        runtime.resourcesCapacity = {};
        runtime.nodeResources = {};

        for(const metric of helpers.resources.METRICS) {
            for(const dict of [runtime.resourcesAllocatable, runtime.resourcesCapacity])
            {
                dict[metric] = { 
                    value: 0,
                    unit: helpers.resources.METRIC_UNITS[metric]
                }
            }
        }

        for(const pool of item.getChildrenByKind(NodeKind.pool))
        {
            const poolRuntime = (<InfraPoolRuntime>pool.runtime);
            runtime.poolCount ++;
            runtime.nodeCount += poolRuntime.nodeCount;

            for(const metric of helpers.resources.METRICS)
            {
                {
                    const value = poolRuntime.resourcesAllocatable[metric];
                    if (value) {
                        runtime.resourcesAllocatable[metric].value += value.value;
                    }
                }
                {
                    const value = poolRuntime.resourcesCapacity[metric];
                    if (value) {
                        runtime.resourcesCapacity[metric].value += value.value;
                    }
                }

                {
                    const value = poolRuntime.nodeResources[metric];
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

        for(const metric of helpers.resources.METRICS)
        {
            if (!runtime.nodeResources[metric])
            {
                runtime.nodeResources[metric] = {
                    value: 0,
                    unit: helpers.resources.METRIC_UNITS[metric]
                }
            }
        }

        const resourcesPropsBuilder = item.buildCustomProperties({
            kind: PropsKind.keyValue,
            id: PropsId.clusterResources,
            config: undefined
        });
        for(const metric of helpers.resources.METRICS)
        {
            {
                const value = runtime.resourcesCapacity[metric];
                if (value)
                {
                    resourcesPropsBuilder.add(helpers.resources.makeMetricProp(metric, helpers.resources.COUNTER_TYPE_CAPACITY), value);
                }
            }
            {
                const value = runtime.resourcesAllocatable[metric];
                if (value)
                {
                    resourcesPropsBuilder.add(helpers.resources.makeMetricProp(metric, helpers.resources.COUNTER_TYPE_ALLOCATABLE), value);
                }
            }
        }
        resourcesPropsBuilder.build();

        item.addProperties({
            kind: PropsKind.keyValue,
            id: PropsId.nodeResources,
            config: runtime.nodeResources
        });

    })
    ;

