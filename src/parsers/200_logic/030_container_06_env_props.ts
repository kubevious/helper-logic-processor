import _ from 'the-lodash';

import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        if (_.keys(runtime.envVars).length > 0)
        {
            item.addProperties({
                kind: "key-value",
                id: "env",
                title: "Environment Variables",
                order: 10,
                config: runtime.envVars
            });    
        }

    })
    ;
