import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        runtime.resourcesLimit = {};
        runtime.resourcesRequest = {};

        for(let metric of helpers.resources.METRICS) {
            collectResourceMetric(metric);
        }

        /*******************************************/

        function collectResourceMetric(metric : string)
        {
            const resources  = config.resources ?? {};

            {
                const limits = resources.limits ?? { };
                let rawValue : string | undefined = limits[metric];
                if (!rawValue) {
                    rawValue = getDefaultMetric(metric);
                }
                if (_.isNotNullOrUndefined(rawValue)) {
                    runtime.resourcesLimit[metric] = helpers.resources.parse(metric, rawValue);
                }
            }

            {
                const requests = resources.requests ?? { };
                let rawValue : string | undefined  = requests[metric];
                if (!rawValue) {
                    rawValue = getDefaultMetric(metric);  // , runtime.resourcesLimit[metric])
                }
                if (_.isNotNullOrUndefined(rawValue)) {
                    runtime.resourcesRequest[metric] = helpers.resources.parse(metric, rawValue);
                }
            }
        }

        function getDefaultMetric(metric: string, defaultValue?: string) : string | undefined
        {
            if (!defaultValue) {
                return undefined;
            }
            return defaultValue;
            // TODO: Get from LimitRange.
            // if (counter == 'request') {
            //     if (metric == 'cpu') {
            //         return '100m';
            //     }
            //     if (metric == 'memory') {
            //         return '100Mi'
            //     }
            // }
        }

    })
    ;
