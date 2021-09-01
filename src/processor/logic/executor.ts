import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope } from "../../scope";

import { LogicParserInfo, LogicTargetPathElement } from './builder'

import { BaseParserExecutor } from '../base/executor';
import { LogicItem } from '../../item';
import { constructArgs, LogicProcessorRuntimeData, LogicProcessorVariableArgs } from './handler-args';

export class LogicParserExecutor<TConfig, TRuntime> implements BaseParserExecutor
{
    private _processor : LogicProcessor;
    private _logger : ILogger;
    private _name : string;
    private _isTraceEnabled: boolean;

    private _parserInfo : LogicParserInfo<TConfig, TRuntime>;
    private _targetPath : LogicTargetPathElement[];

    constructor(processor : LogicProcessor, name : string, parserInfo : LogicParserInfo<TConfig, TRuntime>, isTraceEnabled: boolean)
    {
        this._name = name;
        this._processor = processor;
        this._logger = processor.logger;
        this._parserInfo = parserInfo;
        this._targetPath = parserInfo.target!.path;
        this._isTraceEnabled = isTraceEnabled;
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
            this._logger.info(">>>> Parser Tracer :: %s :: BEGIN", this.name);
        }

        const items = this._extractTreeItems(scope);

        for(let item of items)
        {
            this._processHandler(scope, item);
        }

        if (this._isTraceEnabled) {
            this._logger.info("<<<< Parser Tracer :: %s :: END", this.name);
        }
    }

    private _processHandler(scope : LogicScope, item: LogicItem)
    {
        if (this._isTraceEnabled) {
            this._logger.info("    | - %s", item.dn);
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
                runtimeData);
                
            this._parserInfo.handler!(handlerArgs);

            const newItems = scope.extractLastedStageItems();
            if (this._isTraceEnabled) {
                for(let newItem of newItems) {
                    this._logger.info("      >>> Added: %s", item.dn);
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


    private _extractTreeItems(scope : LogicScope) : LogicItem[]
    {
        let items : LogicItem[] = [];
        if (this._targetPath.length > 0)
        {
            this._visitTreePath(scope.logicRootNode, 0, item => {
                items.push(item);
            });
        }
        else
        {
            this._visitTreeAll(scope.logicRootNode, item => {
                items.push(item);
            });
        }
        return items;
    }

    private _visitTreePath(item : LogicItem, index: number, cb : (item : LogicItem) => void)
    {
        this._logger.silly("[_visitTree] %s, path: %s...", item.dn);

        if (index >= this._targetPath.length)
        {
            cb(item);
        }
        else
        {
            let filter = this._targetPath[index];
            let children = this._findNextNodes(item, filter);
            for(let child of children)
            {
                this._visitTreePath(child, index + 1, cb);
            }
        }
    }

    private _visitTreeAll(item : LogicItem, cb : (item : LogicItem) => void)
    {
        this._logger.silly("[_visitTree] %s, path: %s...", item.dn);

        cb(item);

        let children = item.getChildren();
        for(let child of children)
        {
            this._visitTreeAll(child, cb);
        }
    }

    private _findNextNodes(item : LogicItem, filter: LogicTargetPathElement) : LogicItem[]
    {
        if (filter.name)
        {
            const child = item.findByNaming(filter.kind, filter.name);
            if (child) {
                return [ child ];
            }
            return [];
        }

        let children = item.getChildrenByKind(filter.kind);
        return children;
    }
}
