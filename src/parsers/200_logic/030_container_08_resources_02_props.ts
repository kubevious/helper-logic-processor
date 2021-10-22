import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicContainerParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        const resourcesProps = item.buildCustomProperties({
            kind: PropsKind.keyValue,
            id: PropsId.resources,
            config: undefined
        });

        for(const metric of helpers.resources.METRICS)
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
