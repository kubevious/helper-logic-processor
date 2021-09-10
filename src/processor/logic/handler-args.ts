import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope } from "../../scope";

import { Helpers } from '../../helpers';
import { LogicItem } from '../../';

import { LogicParserInfo } from './builder'

import { AlertInfo } from '../types';

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

    hasCreatedItems() : boolean;
    createAlert(kind : string, severity : string, msg : string) : void;
}

export interface LogicProcessorVariableArgs
{
}


export interface LogicProcessorRuntimeData
{
    createdItems : LogicItem[];
    createdAlerts : AlertInfo[];
}

export function constructArgs<TConfig, TRuntime>(
    processor : LogicProcessor,
    parserInfo : LogicParserInfo<TConfig, TRuntime>,
    scope : LogicScope,
    item: LogicItem,
    variableArgs : LogicProcessorVariableArgs,
    runtimeData : LogicProcessorRuntimeData,
    shouldTrace: boolean) : LogicProcessorHandlerArgs<TConfig, TRuntime>
{

    return {

        logger: processor.logger,
    
        scope: scope,
    
        item: item,
    
        helpers: processor.helpers,
    
        hasCreatedItems : () => 
        {
            return runtimeData.createdItems.length > 0;
        },

        createAlert : (kind : string, severity : string, msg : string) => 
        {
            runtimeData.createdAlerts.push({
                kind,
                severity,
                msg
            });
        },

        config: <TConfig>item.config,

        runtime: <TRuntime>item.runtime,

        trace: shouldTrace

    }
}