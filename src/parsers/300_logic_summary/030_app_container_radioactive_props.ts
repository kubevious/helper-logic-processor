import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';
import { FlagKind } from '@kubevious/entity-meta';

export default LogicContainerParser()
    .handler(({ logger, scope, item, runtime }) => {

        if (_.keys(runtime.radioactiveProps).length > 0)
        {
            item.setPropagatableFlag(FlagKind.radioactive);

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