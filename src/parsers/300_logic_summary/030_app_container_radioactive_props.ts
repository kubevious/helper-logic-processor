import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
    .handler(({ logger, scope, item, runtime }) => {

        if (_.keys(runtime.radioactiveProps).length > 0)
        {
            item.addProperties({
                kind: "key-value",
                id: "radioactive",
                title: "Radioactivity",
                order: 7,
                config: runtime.radioactiveProps
            });
        }
        
    })
    ;