import _ from 'the-lodash';
import { PropertyValueWithUnit } from '../../helpers/resources';
import { InfraNodePoolParser } from '../../parser-builder/infra';
import { InfraNodeRuntime } from '../../types/parser/infra-node';

export default InfraNodePoolParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        runtime.resourcesAllocatable = {};
        runtime.resourcesCapacity = {};
        runtime.nodeResources = {};

        for(let metric of helpers.resources.METRICS) {
            for(let dict of [runtime.resourcesAllocatable, runtime.resourcesCapacity])
            {
                dict[metric] = { 
                    value: 0,
                    unit: helpers.resources.METRIC_UNITS[metric]
                }
            }
        }

        for(let node of item.getChildrenByKind('node'))
        {
            const nodeRuntime = <InfraNodeRuntime>node.runtime;
            runtime.nodeCount++;
            
            for(let metric of helpers.resources.METRICS)
            {
                {
                    let value = nodeRuntime.resourcesAllocatable[metric];
                    if (value) {
                        runtime.resourcesAllocatable[metric].value += value.value;
                    }
                }
                {
                    let value = nodeRuntime.resourcesCapacity[metric];
                    if (value) {
                        runtime.resourcesCapacity[metric].value += value.value;
                    }
                }

                {
                    let value = nodeRuntime.resourcesAllocatable[metric];
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

        const resourcesPropsBuilder = item.buildCustomProperties({
            kind: "key-value",
            id: "pool-resources",
            title: "Pool Resources",
            order: 7,
            config: undefined
        });
        for(let metric of helpers.resources.METRICS)
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
            kind: "key-value",
            id: "node-resources",
            title: "Node Resources",
            order: 8,
            config: runtime.nodeResources
        });

        /*** HELPERS ***/
       

    })
    ;

