import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope } from "../../logic/scope";

import { Helpers } from '../../helpers';
import { LogicItem } from '../../';

export interface CreateItemParams
{
    kind? : string | ((item: LogicItem) => string),
    order? : number
}

export interface LogicProcessorHandlerArgs<TConfig, TRuntime>
{
    readonly logger : ILogger;
    readonly scope : LogicScope;
    readonly item : LogicItem;
    readonly helpers : Helpers;

    readonly config : TConfig;
    readonly runtime : TRuntime;

    readonly trace: boolean;
}


export function constructArgs<TConfig, TRuntime>(
    processor : LogicProcessor,
    helpers: Helpers,
    scope : LogicScope,
    item: LogicItem,
    shouldTrace: boolean) : LogicProcessorHandlerArgs<TConfig, TRuntime>
{

    return {

        logger: processor.logger,
    
        scope: scope,
    
        item: item,
    
        helpers: helpers,

        config: <TConfig>item.config,
        runtime: <TRuntime>item.runtime,

        trace: shouldTrace

    }
}