import _ from 'the-lodash';
import { LogicPodParser } from '../../parser-builder/logic';

export default LogicPodParser()
    .handler(({ logger, config, item, runtime, helpers }) => {

        runtime.radioactiveProps = {};

        const podSpec = config.spec;
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

            for(let container of podSpec.containers)
            {
                if (container.securityContext?.privileged) {
                    runtime.radioactiveProps['privileged'] = true;
                }
            }
        }

    })
    ;
