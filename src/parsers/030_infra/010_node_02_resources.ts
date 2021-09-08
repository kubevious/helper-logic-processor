import _ from 'the-lodash';
import { InfraNodeParser } from '../../parser-builder/infra';

export default InfraNodeParser()
    .trace()
    .handler(({ logger, scope, config, item, helpers }) => {

        const propsBuilder = item.buildCustomProperties({
            kind: "key-value",
            id: "resources",
            title: "Resources",
            order: 7,
            config: undefined
        });

        for(let metric of helpers.resources.METRICS) {
            collectResourceMetric(metric);
        }

        propsBuilder.build();


        /*** HELPERS ***/
        function collectResourceMetric(metric: string)
        {
            collectResourceMetricCounter(metric, 'capacity', config.status?.capacity);
            collectResourceMetricCounter(metric, 'allocatable', config.status?.allocatable);
        }

        function collectResourceMetricCounter(metric: string, counterType: string, counterDict?: { [name: string] : string })
        {
            if (!counterDict) {
                return;
            }
            let rawValue = counterDict[metric];
            if (!rawValue) {
                return;
            }

            propsBuilder.add(`${metric} ${counterType}`, helpers.resources.parse(metric, rawValue))
        }

    })
    ;

