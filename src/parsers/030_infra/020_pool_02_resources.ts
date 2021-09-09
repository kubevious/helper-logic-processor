import _ from 'the-lodash';
import { PropertyValueWithUnit } from '../../helpers/resources';
import { InfraNodePoolParser } from '../../parser-builder/infra';

export default InfraNodePoolParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        runtime.poolResources = {};
        runtime.nodeResources = {};

        for(let metric of helpers.resources.METRICS) {
            for(let counterType of helpers.resources.COUNTER_TYPES)
            {
                runtime.poolResources[helpers.resources.makeMetricProp(metric, counterType)] = { 
                    value: 0,
                    unit: helpers.resources.METRIC_UNITS[metric]
                };
            }
        }

        for(let node of item.getChildrenByKind('node'))
        {
            runtime.nodeCount++;
            
            let nodeProps = node.getProperties('resources');
            if (nodeProps)
            {
                for(let metric of helpers.resources.METRICS)
                {
                    for(let counterType of helpers.resources.COUNTER_TYPES)
                    {
                        let value = <PropertyValueWithUnit>nodeProps.config[helpers.resources.makeMetricProp(metric, counterType)];
                        if (value) {
                            runtime.poolResources[`${metric} ${counterType}`].value += value.value;
                        }
                    }

                    {
                        let value = <PropertyValueWithUnit>nodeProps.config[helpers.resources.makeMetricProp(metric, helpers.resources.COUNTER_TYPE_ALLOCATABLE)];
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
            id: "pool-resources",
            title: "Pool Resources",
            order: 7,
            config: runtime.poolResources
        });

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

