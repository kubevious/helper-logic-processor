import { Container } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { LogicContainerRuntime } from '../../types/parser/logic-container';

const yaml = require('js-yaml');

export default LogicParser<Container, LogicContainerRuntime>()
    .target({
        path: ["logic", "ns", "app", "cont"]
    })
    .target({
        path: ["logic", "ns", "app", "initcont"]
    })
    .handler(({ logger, item, config, runtime, helpers}) => {

        runtime.envVars = {};

        if (!config.env) {
            return;
        }

        for(let envObj of config.env) {
            let value: string | null = null;
            if (envObj.value) {
                value = envObj.value;
            } else if (envObj.valueFrom) {
                value = "<pre>" + yaml.dump(envObj.valueFrom) + "</pre>";
            }

            if (value) {
                runtime.envVars[envObj.name] = value;
            }
        }

    })
    ;
