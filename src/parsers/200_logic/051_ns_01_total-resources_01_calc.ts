import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic'
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicNamespaceParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        runtime.usedResources = {};

        for(const metric of helpers.resources.METRICS) {
            runtime.usedResources[metric] = {
                value: 0,
                unit: helpers.resources.METRIC_UNITS[metric]
            }
        }

        for(const app of item.getChildrenByKind(NodeKind.app))
        {
            const appRuntime = <LogicAppRuntime>app.runtime;

            for(const metric of helpers.resources.METRICS)
            {
                const value = appRuntime.usedResources[metric];
                if (value)
                {
                    runtime.usedResources[metric].value += value!.value;
                }
            }
        }

        for(const metric of helpers.resources.METRICS) {
            
            runtime.usedResources[metric].value = 
                Math.round(runtime.usedResources[metric].value * 100) / 100;
                
        }

    })
    ;
