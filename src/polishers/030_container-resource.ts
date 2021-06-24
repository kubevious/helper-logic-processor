import _ from 'the-lodash';
import { LogicParser } from '../parser-builder';

export default LogicParser()
    .order(30)
    .target({
        path: ["ns", "app", "cont"]
    })
    .handler(({ item, helpers }) => {

        let resourcesProps : Record<string, any> = {
        }
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
            let rawValue = _.get(item.config, 'resources.' + counter + 's.' + metric);
            if (!rawValue) {
                rawValue = getDefaultMetric(metric, counter, defaultValue);
                if (_.isNullOrUndefined(rawValue)) {
                    return null;
                }
            }
            resourcesProps[metric + ' ' + counter] = helpers.resources.parse(metric, rawValue);
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