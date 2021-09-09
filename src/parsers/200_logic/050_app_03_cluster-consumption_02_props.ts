import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic'

export default LogicAppParser()
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
