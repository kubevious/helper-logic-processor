import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope, LogicTarget } from "../../scope";

import { LogicParserInfo } from './builder'

import { BaseParserExecutor } from '../base/executor';
import { LogicItem } from '../../item';
import { constructArgs, LogicProcessorRuntimeData, LogicProcessorVariableArgs } from './handler-args';

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

    execute(scope : LogicScope)
    {
        if (this._isTraceEnabled) {
            this._logger.debug(">>>> Parser Tracer :: %s :: BEGIN", this.name);
        }

        const items = scope.findItemsByPath(this._logicTarget);

        for(let item of items)
        {
            this._processHandler(scope, item);
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

    private _processHandler(scope : LogicScope, item: LogicItem)
    {
        const shouldTrace = this._isItemTraceEnabled(item);
        if (shouldTrace) {
            this._logger.debug("    | - %s", item.dn);
        }

        this._logger.silly("[_processHandler] LogicHandler: %s, Item: %s", 
            this.name, 
            item.dn);

        let variableArgs : LogicProcessorVariableArgs =
        {
        };

        let runtimeData : LogicProcessorRuntimeData = {
            createdItems : [],
            createdAlerts : []
        };

        try
        {
            this._preprocessHandler(scope, item, variableArgs);

            let handlerArgs = constructArgs(
                this._processor,
                this._parserInfo,
                scope,
                item,
                variableArgs,
                runtimeData,
                shouldTrace);
                
            this._parserInfo.handler!(handlerArgs);

            const createdItems = scope.extractLastedStageItems();
            if (shouldTrace) {
                for(let createdItem of createdItems) {
                    this._logger.debug("      >>> Added: %s", createdItem.dn);
                }
            }

            this._postProcessHandler(runtimeData);
        }
        catch(reason)
        {
            this._logger.error("Error in %s parser. ", this.name, reason);
        }

    }

    private _preprocessHandler(scope : LogicScope, item: LogicItem, variableArgs : LogicProcessorVariableArgs)
    {
        variableArgs.namespaceName = null;
        if (this._parserInfo.needNamespaceScope || this._parserInfo.needAppScope)
        {
            if (this._parserInfo.namespaceNameCb) {
                variableArgs.namespaceName = this._parserInfo.namespaceNameCb(item);
            } else {
                variableArgs.namespaceName = _.get(item.config, 'metadata.namespace');
            }
            if (_.isNotNullOrUndefined(variableArgs.namespaceName))
            {
                variableArgs.namespaceScope = scope.getNamespaceScope(variableArgs.namespaceName!);
            }
        }

        variableArgs.appName = null;
        if (this._parserInfo.appNameCb) {
            variableArgs.appName = this._parserInfo.appNameCb(item);
        }
        if (variableArgs.namespaceName && variableArgs.namespaceScope)
        {
            if (this._parserInfo.needAppScope && variableArgs.appName)
            {
                let appScope = variableArgs.namespaceScope.getAppAndScope(
                    variableArgs.appName!,
                    this._parserInfo.canCreateAppIfMissing!);

                if (appScope) {
                    variableArgs.appScope = appScope;
                    variableArgs.app = appScope.item;
                }
            }
        }
    }

    private _postProcessHandler(runtimeData : LogicProcessorRuntimeData)
    {

        for(let alertInfo of runtimeData.createdAlerts)
        {
            for(let createdItem of runtimeData.createdItems)
            {
                createdItem.addAlert(
                    alertInfo.kind, 
                    alertInfo.severity, 
                    alertInfo.msg);
            }
        }

    }

}
