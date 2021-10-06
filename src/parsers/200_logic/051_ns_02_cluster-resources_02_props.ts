import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic'
import { InfraNodesRuntime } from '../../types/parser/infra-nodes';

export default LogicNamespaceParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        item.addProperties({
            kind: "key-value",
            id: "cluster-consumption",
            title: "Cluster Consumption",
            order: 9,
            config: runtime.clusterConsumption
        });

    })
    ;
