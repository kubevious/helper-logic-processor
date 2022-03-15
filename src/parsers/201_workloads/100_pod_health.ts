import _ from 'the-lodash';
import { LogicPodParser } from '../../parser-builder/logic';

export default LogicPodParser()
    .handler(({ logger, scope, item, runtime, config }) => {

        if (config.status?.phase === "Succeeded") {
            return;
        }

        runtime.health.podCount++;

        const conditions = config.status?.conditions ?? [];
        for(const condition of conditions) {
            if (condition.status === 'True')
            {
                if (condition.type === 'Ready') {
                    runtime.health.readyCount++;
                }
                if (condition.type === 'Initialized') {
                    runtime.health.initializedCount++;
                }
                if (condition.type === 'ContainersReady') {
                    runtime.health.containersReadyCount++;
                }
                if (condition.type === 'PodScheduled') {
                    runtime.health.scheduledCount++;
                }
            }
        }

    })
    ;