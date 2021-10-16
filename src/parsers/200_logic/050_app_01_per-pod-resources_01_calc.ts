import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic'
import { LogicContainerRuntime } from '../../types/parser/logic-container';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicAppParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        runtime.perPodResources = {}
        
        for(const metric of helpers.resources.METRICS) {
            runtime.perPodResources[metric] = {
                value: 0,
                unit: helpers.resources.METRIC_UNITS[metric]
            }
        }

        for(const container of item.getChildrenByKind(NodeKind.cont))
        {
            const containerRuntime = <LogicContainerRuntime>container.runtime;
            for(const metric of helpers.resources.METRICS)
            {
                const value = containerRuntime.resourcesRequest[metric];
                if (value)
                {
                    runtime.perPodResources[metric].value += value.value;
                }
            }
        }

    })
    ;
