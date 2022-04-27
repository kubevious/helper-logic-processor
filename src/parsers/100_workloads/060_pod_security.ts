import _ from 'the-lodash';
import { K8sPodParser } from '../../parser-builder/k8s';

export default K8sPodParser()
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

            for(const container of podSpec.containers)
            {
                if (container.securityContext?.privileged) {
                    runtime.radioactiveProps['privileged'] = true;
                }
            }
        }

    })
    ;
