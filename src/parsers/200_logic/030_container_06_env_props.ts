import _ from 'the-lodash';

import { LogicContainerParser } from '../../parser-builder/logic';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicContainerParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        if (_.keys(runtime.envVars).length > 0)
        {
            item.addProperties({
                kind: PropsKind.keyValue,
                id: PropsId.env,
                config: runtime.envVars
            });    
        }

    })
    ;
