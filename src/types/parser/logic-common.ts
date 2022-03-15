export interface LogicCommonWorkload
{
    namespace: string;
    app: string;

    health: LogicWorkloadHealth;
}

export interface LogicWorkloadHealth
{
    podCount: number;
    initializedCount: number;
    scheduledCount: number;
    containersReadyCount: number;
    readyCount: number;
}