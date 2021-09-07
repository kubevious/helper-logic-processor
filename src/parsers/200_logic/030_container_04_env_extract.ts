import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';

const yaml = require('js-yaml');

export default LogicContainerParser()
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
