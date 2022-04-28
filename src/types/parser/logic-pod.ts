import { PodHealthCondition, PodPhase, PodRunStage } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';
import { LogicCommonWorkload } from './logic-common';

export interface LogicPodRuntime extends LogicCommonWorkload
{
    phase: PodPhase;
    runStage?: PodRunStage;
    conditions: PodHealthCondition[];
    
    radioactiveProps: { [ kind : string ] : boolean };
}