import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
    .handler(({ logger, scope, item, config, helpers}) => {

        let resourcesProps : Record<string, any> = { }
        for(let metric of helpers.resources.METRICS) {
            collectResourceMetric(metric);
        }

        item.addProperties({
            kind: "key-value",
            id: "resources",
            title: "Resources",
            order: 7,
            config: resourcesProps
        });

        /*******************************************/

        function collectResourceMetric(metric : string)
        {
            const limitValue = collectResourceMetricCounter(metric, 'limit', null);
            collectResourceMetricCounter(metric, 'request', limitValue);
        }

        function collectResourceMetricCounter(metric: string, counter: string, defaultValue: number | null) : number | null
        {
            let rawValue = _.get(config.resources ?? {}, `${counter}s.${metric}`);
            if (!rawValue) {
                rawValue = getDefaultMetric(metric, counter, defaultValue);
                if (_.isNullOrUndefined(rawValue)) {
                    return null;
                }
            }
            resourcesProps[helpers.resources.makeMetricProp(metric, counter)] = helpers.resources.parse(metric, rawValue);
            return rawValue;
        }

        function getDefaultMetric(metric: string, counter: string, defaultValue: number | null)
        {
            return defaultValue;
            // TODO: Get from LimitRange.
            if (counter == 'request') {
                if (metric == 'cpu') {
                    return '100m';
                }
                if (metric == 'memory') {
                    return '100Mi'
                }
            }
        }

    })
    ;
