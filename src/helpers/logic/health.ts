import _ from 'the-lodash';

import { PropsKind, PropsId } from '@kubevious/entity-meta';
import { ILogger } from "the-logger";

import { Helpers } from '..';
import { LogicItem } from '../../logic/item';
import { LogicScope } from '../../logic/scope';
import { LogicCommonWorkload, LogicWorkloadHealth } from '../../types/parser/logic-common';

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
    }

    mergeHealthRuntime(result: LogicCommonWorkload, childrenRuntimes: LogicCommonWorkload[])
    {
        const targetHealth : LogicWorkloadHealth = result.health;

        for(const childRuntime of childrenRuntimes)
        {
            const childHealth : LogicWorkloadHealth = childRuntime.health;

            for(const key of _.keys(childHealth))
            {
                (targetHealth as any)[key] += (childHealth as any)[key];
            }
        }
    }

    buildHealthProperties(item: LogicItem, runtime: LogicCommonWorkload)
    {
        const health = runtime.health;
        const count = health.pods;

        const config : any = {};
        for(const key of _.keys(health))
        {
            const value = (health as any)[key] as number;
            const perc = (count > 0) ? Math.round(value * 100 / count) : 0;
            config[key] = {
                count: value,
                perc: perc
            }
        }

        item.addProperties({
            kind: PropsKind.healthTable,
            id: PropsId.health,
            config: config
        });
    }

}   