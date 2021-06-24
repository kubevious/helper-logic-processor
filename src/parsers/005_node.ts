import _ from 'the-lodash';
import { ConcreteParser } from '../parser-builder';

export default ConcreteParser()
    .order(5)
    .target({
        api: "v1",
        kind: "Node"
    })
    .kind('node')
    .handler(({ scope, item, createK8sItem, infraScope, helpers }) => {

        infraScope.increaseNodeCount();
        
        let infra = scope.fetchInfraRawContainer();

        let nodes = infra.fetchByNaming("nodes", "Nodes");

        let node = createK8sItem(nodes);

        let resourcesProps : Record<string, Record<string, any>> = {
        }
        for(let metric of helpers.resources.METRICS) {
            collectResourceMetric(metric);
        }

        node.addProperties({
            kind: "key-value",
            id: "resources",
            title: "Resources",
            order: 7,
            config: resourcesProps
        });

        /********/

        function collectResourceMetric(metric: string)
        {
            collectResourceMetricCounter(metric, 'capacity');
            collectResourceMetricCounter(metric, 'allocatable');
        }

        function collectResourceMetricCounter(metric: string, counter: string)
        {
            let rawValue = _.get(item.config, 'status.' + counter + '.' + metric);
            if (!rawValue) {
                return;
            }
            resourcesProps[metric + ' ' + counter] = helpers.resources.parse(metric, rawValue);
        }

    })
    ;
