import _ from 'the-lodash';
import { PropertyValueWithUnit } from '../../helpers/resources';
import { InfraNodePoolParser } from '../../parser-builder/infra';

export default InfraNodePoolParser()
    .trace()
    .handler(({ logger, scope, config, item, helpers }) => {

        let nodesResourcesProps : Record<string, PropertyValueWithUnit> = {}
        let perNodeResources : Record<string, PropertyValueWithUnit | null> = {}
        
        for(let metric of helpers.resources.METRICS) {
            for(let counterType of ['allocatable', 'capacity'])
            {
                nodesResourcesProps[`${metric} ${counterType}`] = { 
                    value: 0,
                    unit: helpers.resources.METRIC_UNITS[metric]
                };
            }
            perNodeResources[metric] = null;
        }

        for(let node of item.getChildrenByKind('node'))
        {
            let nodeProps = node.getProperties('resources');
            if (nodeProps)
            {
                for(let metric of helpers.resources.METRICS)
                {
                    for(let counterType of ['allocatable', 'capacity'])
                    {
                        let value = <PropertyValueWithUnit>nodeProps.config[`${metric} ${counterType}`];
                        if (value) {
                            nodesResourcesProps[`${metric} ${counterType}`].value += value.value;
                        }
                    }

                    {
                        let value = <PropertyValueWithUnit>nodeProps.config[`${metric} allocatable`];
                        if (value)
                        {
                            if (perNodeResources[metric] != null)
                            {
                                perNodeResources[metric] = {
                                    value: Math.min(perNodeResources[metric]!.value, value.value),
                                    unit: perNodeResources[metric]!.unit
                                };
                            }
                            else
                            {
                                perNodeResources[metric] = value;
                            }
                        }
                    }
                }
            }
        }

        let nodeResourcesProps : Record<string, PropertyValueWithUnit> = {}
        for(let metric of helpers.resources.METRICS)
        {
            if (perNodeResources[metric] == null)
            {
                perNodeResources[metric] = {
                    value: 0,
                    unit: helpers.resources.METRIC_UNITS[metric]
                }
            }
            nodeResourcesProps[metric] = perNodeResources[metric]!;
        }

        item.addProperties({
            kind: "key-value",
            id: "pool-resources",
            title: "Pool Resources",
            order: 7,
            config: nodesResourcesProps
        });

        item.addProperties({
            kind: "key-value",
            id: "node-resources",
            title: "Node Resources",
            order: 8,
            config: nodeResourcesProps
        });

        /*** HELPERS ***/
       

    })
    ;

