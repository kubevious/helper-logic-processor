import _ from 'the-lodash';

import { LogicLauncherParser } from '../../parser-builder/logic';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime }) => {

        runtime.radioactiveProps = {};

        const securityContext = config.spec?.template.spec?.securityContext;
        if (securityContext) {
            // securityContext.
        }

        const podSpec = config.spec?.template.spec;
        if (podSpec) {
            if (podSpec.hostIPC) {
                runtime.radioactiveProps['hostIPC'] = true;
            }
            if (podSpec.hostNetwork) {
                runtime.radioactiveProps['hostNetwork'] = true;
            }
            if (podSpec.hostPID) {
                runtime.radioactiveProps['hostPID'] = true;
            }
            if (_.get(podSpec, 'securityContext.privileged')) {
                runtime.radioactiveProps['privileged'] = true;
            }
        }

    })
    ;
