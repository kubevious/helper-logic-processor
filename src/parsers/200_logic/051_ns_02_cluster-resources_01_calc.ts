import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic'
import { InfraNodesRuntime } from '../../types/parser/infra-nodes';

export default LogicNamespaceParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        runtime.clusterConsumption = {};

        const nodes = scope.findItem('root/infra/nodes')!;
        const nodesRuntime = <InfraNodesRuntime>nodes.runtime;

        for(const metric of helpers.resources.METRICS)
        {
            const usedValue = runtime.usedResources[metric]?.value ?? 0;
            const availValue = nodesRuntime.resourcesAllocatable[metric]?.value;

            let consumption: number;
            if (!availValue) {
                consumption = 0;
            } else {
                consumption = usedValue / availValue;
            }
            runtime.clusterConsumption[metric] = {
                value: consumption,
                unit: '%'
            }
            ;
        }

    })
    ;
