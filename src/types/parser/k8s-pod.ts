import { PodHealthCondition, PodPhase, PodRunStage } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';
import { HistogramBucket } from '@kubevious/entity-meta/dist/props-config/histogram-bucket';

export interface K8sPodRuntime
{    
    phase: PodPhase;
    runStage?: PodRunStage;
    conditions: PodHealthCondition[];
    failureReasons: Record<string, boolean>;

    restartCount: number;
    restartCountBucket: HistogramBucket;
    
    envVars: Record<string, string | null>;

    radioactiveProps: { [ kind : string ] : boolean };
}