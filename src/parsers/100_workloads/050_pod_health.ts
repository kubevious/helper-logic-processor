import { PodPhase, PodRunStage } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';
import _ from 'the-lodash';
import { K8sPodParser } from '../../parser-builder/k8s';

export default K8sPodParser()
    .handler(({ logger, config, item, metadata, helpers, scope, runtime }) => {
        
        runtime.phase = (config.status?.phase as PodPhase) ?? PodPhase.Unknown;
        runtime.conditions = [];

        if (runtime.phase === PodPhase.Running)
        {
            const conditionList = config.status?.conditions ?? [];
            runtime.conditions = conditionList.map(x => ({
                type: x.type,
                state: x.status === 'True'
            }));
            const conditionDict = _.makeDict(runtime.conditions, x => x.type, x => x.state);

            runtime.runStage = PodRunStage.Scheduling;

            if (conditionDict['PodScheduled'])
            {
                runtime.runStage = PodRunStage.Initializing;
            }

            if (runtime.runStage === PodRunStage.Initializing &&
                conditionDict['Initialized'])
            {
                runtime.runStage = PodRunStage.WaitingContainersReady;
            }

            if (runtime.runStage === PodRunStage.WaitingContainersReady &&
                conditionDict['ContainersReady'])
            {
                runtime.runStage = PodRunStage.WaitingConditions;
            }

            if (conditionDict['Ready'])
            {
                runtime.runStage = PodRunStage.Ready;
            }

        }

    })
    ;

const DEFAULT_CONDITIONS = [
    "PodScheduled",
    "Initialized",
    "ContainersReady",
    "Ready"
];
const DEFAULT_CONDITIONS_DICT = _.makeDict(DEFAULT_CONDITIONS, x => x, x => true);