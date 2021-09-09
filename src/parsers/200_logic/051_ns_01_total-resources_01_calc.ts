import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic'
import { LogicAppRuntime } from '../../types/parser/logic-app';

export default LogicNamespaceParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        runtime.usedResources = {};

        for(let metric of helpers.resources.METRICS) {
            runtime.usedResources[metric] = {
                value: 0,
                unit: helpers.resources.METRIC_UNITS[metric]
            }
        }

        for(let app of item.getChildrenByKind('app'))
        {
            const appRuntime = <LogicAppRuntime>app.runtime;

            for(let metric of helpers.resources.METRICS)
            {
                let value = appRuntime.usedResources[metric];
                if (value)
                {
                    runtime.usedResources[metric].value += value!.value;
                }
            }
        }

        for(let metric of helpers.resources.METRICS) {
            
            runtime.usedResources[metric].value = 
                Math.round(runtime.usedResources[metric].value * 100) / 100;
                
        }

    })
    ;
