import _ from 'the-lodash';
import { PropertyValueWithUnit } from '../../helpers/resources';
import { LogicAppParser } from '../../parser-builder/logic'

export default LogicAppParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        runtime.perPodResources = {}
        
        for(let metric of helpers.resources.METRICS) {
            runtime.perPodResources[helpers.resources.makeMetricProp(metric, 'request')] = {
                value: 0,
                unit: helpers.resources.METRIC_UNITS[metric]
            }
        }

        for(let container of item.getChildrenByKind('cont'))
        {
            let contResourceProps = container.getProperties('resources');
            if (contResourceProps)
            {
                let contResource = <Record<string, PropertyValueWithUnit>> contResourceProps.config;
                for(let metric of helpers.resources.METRICS)
                {
                    let value = _.get(contResource, helpers.resources.makeMetricProp(metric, 'request'));
                    if (value)
                    {
                        runtime.perPodResources[helpers.resources.makeMetricProp(metric, 'request')].value += value.value;
                    }
                }
            }
        }

        item.addProperties({
            kind: "key-value",
            id: "resources-per-pod",
            title: "Resources Per Pod",
            order: 8,
            config: runtime.perPodResources
        });

    })
    ;
