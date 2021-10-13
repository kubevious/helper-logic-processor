import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope, LogicTarget } from "../../logic/scope";

import { LogicParserInfo } from './builder'

import { BaseParserExecutor } from '../base/executor';
import { LogicItem } from '../../';
import { constructArgs } from './handler-args';
import { Helpers } from '../../helpers';

export class LogicParserExecutor<TConfig, TRuntime> implements BaseParserExecutor
{
    private _processor : LogicProcessor;
    private _logger : ILogger;
    private _name : string;
    private _isTraceEnabled: boolean;
    private _isDnTraceEnabledCb: (dn: string) => boolean;

    private _parserInfo : LogicParserInfo<TConfig, TRuntime>;
    private _logicTarget : LogicTarget;

    constructor(processor : LogicProcessor, 
        name : string,
        parserInfo : LogicParserInfo<TConfig, TRuntime>,
        isTraceEnabled: boolean,
        isDnTraceEnabledCb: (dn: string) => boolean)
    {
        this._name = name;
        this._processor = processor;
        this._logger = processor.parserLogger;
        this._parserInfo = parserInfo;
        this._logicTarget = parserInfo.target!;
        this._isTraceEnabled = isTraceEnabled;
        this._isDnTraceEnabledCb = isDnTraceEnabledCb;
    }

    get kind() {
        return 'Logic';
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
        if (this._isTraceEnabled) {
            this._logger.debug(">>>> Parser Tracer :: %s :: BEGIN", this.name);
        }

        const items = scope.findItemsByPath(this._logicTarget);

        for(const item of items)
        {
            this._processHandler(scope, helpers, item);
        }

        if (this._isTraceEnabled) {
            this._logger.debug("<<<< Parser Tracer :: %s :: END", this.name);
        }
    }

    private _isItemTraceEnabled(item: LogicItem)
    {
        if (this._isTraceEnabled) {
            return this._isDnTraceEnabledCb(item.dn);
        }
        return false;
    }

    private _processHandler(scope : LogicScope, helpers: Helpers, item: LogicItem)
    {
        const shouldTrace = this._isItemTraceEnabled(item);
        if (shouldTrace) {
            this._logger.debug("    | - %s", item.dn);
        }

        this._logger.silly("[_processHandler] LogicHandler: %s, Item: %s", 
            this.name, 
            item.dn);

        try
        {
            const handlerArgs = constructArgs<TConfig, TRuntime>(
                this._processor,
                helpers,
                scope,
                item,
                shouldTrace);
                
            this._parserInfo.handler!(handlerArgs);

            const lastStageData = scope.extractLastedStageData();

            if (shouldTrace) {
                for(const createdItem of lastStageData.createdItems) {
                    this._logger.debug("      >>> Added: %s", createdItem.dn);
                }

                for(const alertInfo of lastStageData.createdAlerts) {
                    this._logger.debug("      !!! %s", alertInfo.item.dn);
                    this._logger.debug("        ! %s :: %s", alertInfo.alert.severity, alertInfo.alert.id);
                    this._logger.debug("        ! %s", alertInfo.alert.msg);
                }
            }
        }
        catch(reason)
        {
            this._logger.error("Error in %s parser. ", this.name, reason);
        }

    }

}
