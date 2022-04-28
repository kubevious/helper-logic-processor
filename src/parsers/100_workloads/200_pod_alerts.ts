import _ from 'the-lodash';
import { ValidatorID } from '@kubevious/entity-meta';
import { K8sPodParser } from '../../parser-builder/k8s';
import { PodPhase } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';
import { ContainerState, ContainerStatus } from 'kubernetes-types/core/v1';

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

        const containerStatuses = config.status?.containerStatuses ?? [];
        for(const containerStatus of containerStatuses)
        {
            processContainerStatus(containerStatus);
        }

        /** ** **/
        function processContainerStatus(containerStatus: ContainerStatus)
        {
            if (containerStatus.state) {
                processContainerState(containerStatus.name, containerStatus.state);
            }

            if (containerStatus.lastState) {
                processContainerState(containerStatus.name, containerStatus.lastState);
            }
        }

        function processContainerState(containerName: string, containerState: ContainerState)
        {
            // TODO: ValidatorID.POD_LIFECYCLE

            if (containerState.waiting) {
                const reason =  containerState.waiting.reason ?? '';
                const message = containerState.waiting.message ?? '';

                if (reason) {
                    runtime.failureReasons[reason] = true;
                }

                item.raiseAlert(ValidatorID.POD_LIFECYCLE, `Container "${containerName}" Waiting. Reason: ${reason}. ${message}`);
            }

            if (containerState.terminated) {
                if (containerState.terminated.exitCode !== 0) {
                    const reason =  containerState.terminated.reason ?? '';
                    const message = containerState.terminated.message ?? '';
                    const exitCode = containerState.terminated.exitCode;

                    if (reason) {
                        runtime.failureReasons[reason] = true;
                    }
    
                    item.raiseAlert(ValidatorID.POD_LIFECYCLE, `Container "${containerName}" Terminated. Reason: ${reason}. ExitCode: ${exitCode}. ${message}`);
                }
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


