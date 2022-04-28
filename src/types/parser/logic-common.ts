import { HistogramBucket } from '@kubevious/entity-meta/dist/props-config/histogram-bucket';

export interface LogicCommonWorkload
{
    namespace: string;
    app: string;

    health: LogicWorkloadHealth;
    restartedPodsBucket: HistogramBucket;
}

export interface LogicWorkloadHealth
{
    pods: number;
    pending: number;
    running: number;
    succeeded: number;
    failed: number;
    unknown: number;

    /* running phase */
    scheduling: number;
    initializing: number;
    waitingContainersReady: number;
    waitingConditions: number;
    waitingReady: number;
    ready: number;
}