import _ from 'the-lodash';

import { PropsKind, PropsId } from '@kubevious/entity-meta';
import { ILogger } from "the-logger";

import { Helpers } from '..';
import { LogicItem } from '../../logic/item';
import { LogicScope } from '../../logic/scope';
import { LogicCommonWorkload, LogicWorkloadHealth } from '../../types/parser/logic-common';
import { BucketKeys, HistogramBucket } from '@kubevious/entity-meta/dist/props-config/histogram-bucket';
import { WorkloadHealthConfig, WorkloadHealthMetric } from '@kubevious/entity-meta/dist/props-config/app-health';

export class LogicHealthUtils
{
    private _helpers: Helpers;
    private _logger: ILogger;
    private _scope : LogicScope;

    constructor(helpers: Helpers, logger: ILogger, scope: LogicScope)
    {
        this._helpers = helpers;
        this._logger = logger;
        this._scope = scope;
    }

    setupHealthRuntime(runtime: LogicCommonWorkload)
    {
        runtime.health = {
            pods: 0,
            pending: 0,
            running: 0,
            succeeded: 0,
            failed: 0,
            unknown: 0,
        
            /* running phase */
            scheduling: 0,
            initializing: 0,
            waitingContainersReady: 0,
            waitingConditions: 0,
            waitingReady: 0,
            ready: 0,
        }

        runtime.restartedPodsBucket = {
            [BucketKeys.BUCKET_15_MINS]: 0,
            [BucketKeys.BUCKET_1_HR]: 0,
            [BucketKeys.BUCKET_8_HRS]: 0,
            [BucketKeys.BUCKET_1_DAY]: 0,
        }
    }

    mergeHealthRuntime(result: LogicCommonWorkload, childrenRuntimes: LogicCommonWorkload[])
    {
        const targetHealth : LogicWorkloadHealth = result.health;
        const targetRestartedPodsBucket: HistogramBucket = result.restartedPodsBucket;

        for(const childRuntime of childrenRuntimes)
        {
            {
                const childHealth : LogicWorkloadHealth = childRuntime.health;
                for(const key of _.keys(childHealth))
                {
                    (targetHealth as any)[key] += (childHealth as any)[key];
                }
            }
            {
                const childRestartedPodsBucket: HistogramBucket = childRuntime.restartedPodsBucket;
                for(const key of _.keys(childRestartedPodsBucket))
                {
                    (targetRestartedPodsBucket as any)[key] += (childRestartedPodsBucket as any)[key];
                }
            }
        }
    }

    buildHealthProperties(item: LogicItem, runtime: LogicCommonWorkload)
    {
        const health = runtime.health;
        const total = health.pods;

        const totalRunning = health.pending + health.running + health.unknown;

        const config : WorkloadHealthConfig = {
            pods: this._makeMetric(health.pods, total),
            pending: this._makeMetric(health.pending, total),
            running: this._makeMetric(health.running, total),
            succeeded: this._makeMetric(health.succeeded, total),
            failed: this._makeMetric(health.failed, total),
            unknown: this._makeMetric(health.unknown, total),

            scheduling: this._makeMetric(health.scheduling, totalRunning),
            initializing: this._makeMetric(health.initializing, totalRunning),
            waitingContainersReady: this._makeMetric(health.waitingContainersReady, totalRunning),
            waitingConditions: this._makeMetric(health.waitingConditions, totalRunning),
            waitingReady: this._makeMetric(health.waitingReady, totalRunning),
            ready: this._makeMetric(health.ready, totalRunning),

            restartedPods: runtime.restartedPodsBucket
        };

        item.addProperties({
            kind: PropsKind.workloadsHealth,
            id: PropsId.health,
            config: config
        });
    }

    private _makeMetric(value: number, total: number): WorkloadHealthMetric
    {
        const perc = (total > 0) ? Math.round(value * 100 / total) : 0;
        return {
            count: value,
            perc: perc
        }
    }

}   