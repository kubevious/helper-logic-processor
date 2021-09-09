import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic'

export default LogicNamespaceParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        item.addProperties({
            kind: "key-value",
            id: "resources",
            title: "Resources",
            order: 6,
            config: runtime.usedResources
        });

    })
    ;
