import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope } from "../../logic/scope";

import { Helpers } from '../../helpers';
import { LogicItem } from '../../';

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
}


export function constructArgs(
    processor : LogicProcessor,
    helpers: Helpers,
    scope : LogicScope,
    item: IConcreteItem) : ConcreteProcessorHandlerArgs
{

    return {

        logger: processor.logger,
    
        scope: scope,
    
        item: item,
    
        helpers: helpers,

    }
}