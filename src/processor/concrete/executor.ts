import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope } from "../../logic/scope";

import { ConcreteParserInfo } from './builder'
import { IConcreteRegistry, IConcreteItem } from '../../types/registry';

import { constructArgs } from './handler-args';

import { BaseParserExecutor } from '../base/executor';
import { Helpers } from '../../helpers';

export class ConcreteParserExecutor implements BaseParserExecutor
{
    private _concreteRegistry : IConcreteRegistry;
    private _processor : LogicProcessor;
    private _logger : ILogger;
    private _name : string;

    private _parserInfo : ConcreteParserInfo;

    constructor(concreteRegistry: IConcreteRegistry, processor : LogicProcessor, name : string, parserInfo : ConcreteParserInfo)
    {
        this._name = name;
        this._processor = processor;
        this._logger = processor.parserLogger;
        this._concreteRegistry = concreteRegistry;
        this._parserInfo = parserInfo;
    }

    get kind() {
        return 'Concrete';
    }

    get name() : string {
        return this._name;
    }

    get targetInfo() : string {
        if (!this._parserInfo.target) {
            return '';
        }
        return _.stableStringify(this._parserInfo.target);
    }

    execute(scope : LogicScope, helpers: Helpers)
    {
        const items = this._concreteRegistry.filterItems(this._parserInfo.target);

        for(const item of items)
        {
            this._processHandler(scope, helpers, item);
        }
    }

    private _processHandler(scope : LogicScope, helpers: Helpers, item: IConcreteItem)
    {
        this._logger.silly("[_processHandler] ConcreteHandler: %s, Item: %s", 
            this.name, 
            item.id);

        try
        {
            const handlerArgs = constructArgs(
                this._processor,
                helpers,
                scope,
                item);
    
            this._parserInfo.handler!(handlerArgs);
        }
        catch(reason)
        {
            this._logger.error("Error in %s parser. Item: %s", this.name, item.id, reason);
        }

    }


}
