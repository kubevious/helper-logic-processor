import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic'

export default LogicAppParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        item.addProperties({
            kind: "key-value",
            id: "resources",
            title: "Resources",
            order: 7,
            config: runtime.usedResources
        });

    })
    ;
