import _ from 'the-lodash';
import { PropertyValueWithUnit } from '../../helpers/resources';
import { LogicAppParser } from '../../parser-builder/logic'
import { LogicContainerRuntime } from '../../types/parser/logic-container';

export default LogicAppParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        runtime.perPodResources = {}
        
        for(let metric of helpers.resources.METRICS) {
            runtime.perPodResources[metric] = {
                value: 0,
                unit: helpers.resources.METRIC_UNITS[metric]
            }
        }

        for(let container of item.getChildrenByKind('cont'))
        {
            const containerRuntime = <LogicContainerRuntime>container.runtime;
            for(let metric of helpers.resources.METRICS)
            {
                let value = containerRuntime.resourcesRequest[metric];
                if (value)
                {
                    runtime.perPodResources[metric].value += value.value;
                }
            }
        }

    })
    ;
