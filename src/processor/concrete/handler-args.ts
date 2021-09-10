import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope } from "../../scope";

import { Helpers } from '../../helpers';
import { LogicItem } from '../../item';

import { ConcreteParserInfo } from './builder'
import { IConcreteItem } from '../../types/registry';

import { AlertInfo } from '../types';

export interface CreateItemParams
{
    kind? : string | ((item: IConcreteItem) => string),
    order? : number
}

export interface ConcreteProcessorHandlerArgs
{
    readonly logger : ILogger;
    readonly scope : LogicScope;
    readonly item : IConcreteItem;
    readonly helpers : Helpers;

    hasCreatedItems() : boolean;
    createAlert(kind : string, severity : string, msg : string) : void;
}

export interface ConcreteProcessorVariableArgs
{
    // namespaceName? : string | null;
    // namespaceScope? : NamespaceScope | null;

    // appName? : string | null;
    // appScope?: AppScope | null;
    // app?: LogicItem | null;
}


export interface ConcreteProcessorRuntimeData
{
    createdItems : LogicItem[];
    createdAlerts : AlertInfo[];
}


export function constructArgs(
    processor : LogicProcessor,
    parserInfo : ConcreteParserInfo,
    scope : LogicScope,
    item: IConcreteItem,
    variableArgs : ConcreteProcessorVariableArgs,
    runtimeData : ConcreteProcessorRuntimeData) : ConcreteProcessorHandlerArgs
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
        }

    }
}