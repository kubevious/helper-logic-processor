import { PodHealthCondition, PodPhase, PodRunStage } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';

export interface K8sPodRuntime
{    
    phase: PodPhase;
    runStage?: PodRunStage;
    conditions: PodHealthCondition[];
    
    envVars: Record<string, string | null>;

    radioactiveProps: { [ kind : string ] : boolean };
}