import _ from 'the-lodash';
import { LogicParser } from '../parser-builder';

export default LogicParser()
    .order(30)
    .target({
        path: ["ns", "app", "cont"]
    })
    .handler(({ item, helpers }) => {

        var resourcesProps : Record<string, any> = {
        }
        for(var metric of helpers.resources.METRICS) {
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
            collectResourceMetricCounter(metric, 'request');
            collectResourceMetricCounter(metric, 'limit');
        }

        function collectResourceMetricCounter(metric: string, counter: string)
        {
            var rawValue = _.get(item.config, 'resources.' + counter + 's.' + metric);
            if (!rawValue) {
                rawValue = getDefaultMetric(metric, counter);
                if (!rawValue) {
                    return;
                }
            }
            resourcesProps[metric + ' ' + counter] = helpers.resources.parse(metric, rawValue);
        }

        function getDefaultMetric(metric: string, counter: string)
        {
            return null;
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