import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic'

export default LogicAppParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        item.addProperties({
            kind: "key-value",
            id: "resources-per-pod",
            title: "Resources Per Pod",
            order: 8,
            config: runtime.perPodResources
        });

    })
    ;
