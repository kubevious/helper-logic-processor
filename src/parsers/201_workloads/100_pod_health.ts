import { PodPhase, PodRunStage } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';
import _ from 'the-lodash';
import { LogicPodParser } from '../../parser-builder/logic';

export default LogicPodParser()
    .handler(({ logger, scope, item, runtime, config }) => {

        const health = runtime.health;
        health.pods++;

        if (runtime.phase === PodPhase.Running) {
            health.running++;

            if (runtime.runStage === PodRunStage.Scheduling) {
                health.scheduling++;
            }
            else if (runtime.runStage === PodRunStage.Initializing) {
                health.initializing++;
            }
            else if (runtime.runStage === PodRunStage.WaitingContainersReady) {
                health.waitingContainersReady++;
            }
            else if (runtime.runStage === PodRunStage.WaitingConditions) {
                health.waitingConditions++;
            }
            else if (runtime.runStage === PodRunStage.WaitingReady) {
                health.waitingReady++;
            }
            else if (runtime.runStage === PodRunStage.Ready) {
                health.ready++;
            }
        }
        else if (runtime.phase === PodPhase.Succeeded) {
            health.succeeded++;
        }
        else if (runtime.phase === PodPhase.Failed) {
            health.failed++;
        }
        else if (runtime.phase === PodPhase.Pending) {
            health.pending++;
        }
        else {
            health.unknown++;
        }

    })
    ;