import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        const resourcesProps = item.buildCustomProperties({
            kind: "key-value",
            id: "resources",
            title: "Resources",
            order: 7,
            config: undefined
        });

        for(let metric of helpers.resources.METRICS)
        {
            {
                const value = runtime.resourcesLimit[metric];
                if (value)
                {
                    resourcesProps.add(helpers.resources.makeMetricProp(metric, 'limit'), value);
                }
            }
            {
                const value = runtime.resourcesRequest[metric];
                if (value)
                {
                    resourcesProps.add(helpers.resources.makeMetricProp(metric, 'request'), value);
                }
            }
        }

        resourcesProps.build();
    })
    ;
