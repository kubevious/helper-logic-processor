import _ from 'the-lodash';
import { ValidatorID } from '@kubevious/entity-meta';
import { K8sPodParser } from '../../parser-builder/k8s';
import { PodPhase } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';

export default K8sPodParser()
    .handler(({ config, item, runtime }) => {

        if (runtime.phase === PodPhase.Succeeded) {
            return;
        }

        const conditions = config.status?.conditions ?? [];
        for(const condition of conditions) {
            if (condition.status != 'True') {
                let msg = `There was error with ${condition.type}.`;
                if (condition.message) {
                    msg += ' ' + condition.message;
                }

                const validator = CONDITION_TO_VALIDATOR_MAP[condition.type] ?? ValidatorID.POD_STATUS_OTHER_CONDITION;
                item.raiseAlert(validator, msg);
            }
        }

    })
    ;

const CONDITION_TO_VALIDATOR_MAP : Record<string, ValidatorID> = {
    'PodScheduled': ValidatorID.POD_STATUS_NOT_SCHEDULED,
    'ContainersReady': ValidatorID.POD_STATUS_NOT_CONTAINERS_READY,
    'Initialized': ValidatorID.POD_STATUS_NOT_INITIALIZED,
    'Ready': ValidatorID.POD_STATUS_NOT_READY,
}
