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
        
        var infra = scope.fetchInfraRawContainer();

        var nodes = infra.fetchByNaming("nodes", "Nodes");

        var node = createK8sItem(nodes);

        var resourcesProps : Record<string, Record<string, any>> = {
        }
        for(var metric of helpers.resources.METRICS) {
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
            var rawValue = _.get(item.config, 'status.' + counter + '.' + metric);
            if (!rawValue) {
                return;
            }
            resourcesProps[metric + ' ' + counter] = helpers.resources.parse(metric, rawValue);
        }

    })
    ;
