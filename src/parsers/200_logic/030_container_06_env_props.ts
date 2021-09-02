import { Container } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { LogicContainerRuntime } from '../../types/parser/logic-container';

const yaml = require('js-yaml');

export default LogicParser<Container, LogicContainerRuntime>()
    .target({
        path: ["logic", "ns", "app","cont"]
    })
    .target({
        path: ["logic", "ns", "app", "initcont"]
    })
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
