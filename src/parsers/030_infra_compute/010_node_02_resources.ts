import _ from 'the-lodash';
import { PropertyValueWithUnit } from '../../helpers/resources';
import { InfraNodeParser } from '../../parser-builder/infra';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default InfraNodeParser()
    .handler(({ logger, scope, config, runtime, item, helpers }) => {

        runtime.resourcesCapacity = {};
        runtime.resourcesAllocatable = {};

        for(const metric of helpers.resources.METRICS) {
            collectResourceMetric(metric);
        }

        const propsBuilder = item.buildCustomProperties({
            kind: PropsKind.keyValue,
            id: PropsId.resources,
            title: "Resources",
            order: 7,
            config: undefined
        });

        for(const metric of helpers.resources.METRICS)
        {
            {
                const value = runtime.resourcesCapacity[metric];
                if (value)
                {
                    propsBuilder.add(helpers.resources.makeMetricProp(metric, helpers.resources.COUNTER_TYPE_CAPACITY), value);
                }
            }
            {
                const value = runtime.resourcesAllocatable[metric];
                if (value)
                {
                    propsBuilder.add(helpers.resources.makeMetricProp(metric, helpers.resources.COUNTER_TYPE_ALLOCATABLE), value);
                }
            }
        }

        propsBuilder.build();

        /*** HELPERS ***/
        function collectResourceMetric(metric: string)
        {
            collectResourceMetricCounter(metric, config.status?.capacity, runtime.resourcesCapacity);
            collectResourceMetricCounter(metric, config.status?.allocatable, runtime.resourcesAllocatable);
        }

        function collectResourceMetricCounter(metric: string, configCounterDict: { [name: string] : string } | undefined, resources : { [ metric: string] : PropertyValueWithUnit })
        {
            if (!configCounterDict) {
                return;
            }
            const rawValue = configCounterDict[metric];
            if (!rawValue) {
                return;
            }

            resources[metric] = helpers.resources.parse(metric, rawValue);
        }

    })
    ;

