import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        runtime.radioactiveProps = {};

        if (!config.securityContext) {
            return;
        }

        if (config.securityContext.privileged) {
            runtime.radioactiveProps['privileged'] = true;
        }

    })
    ;
