import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope } from "../../scope";

import { ConcreteParserInfo } from './builder'
import { IConcreteRegistry, IConcreteItem } from '../../registry';

import { constructArgs, ConcreteProcessorVariableArgs, ConcreteProcessorRuntimeData } from './handler-args';

import { BaseParserExecutor } from '../base/executor';

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
        this._logger = processor.logger;
        this._concreteRegistry = concreteRegistry;
        this._parserInfo = parserInfo;
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
        let items = this._concreteRegistry.filterItems(this._parserInfo.target);

        for(let item of items)
        {
            this._processHandler(scope, item);
        }
    }

    _processHandler(scope : LogicScope, item: IConcreteItem)
    {
        this._logger.silly("[_processHandler] ConcreteHandler: %s, Item: %s", 
            this.name, 
            item.id);

        let variableArgs : ConcreteProcessorVariableArgs =
        {
        };

        let runtimeData : ConcreteProcessorRuntimeData = {
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

            this._postProcessHandler(runtimeData);
        }
        catch(reason)
        {
            this._logger.error("Error in %s parser. ", this.name, reason);
        }

    }

    private _preprocessHandler(scope : LogicScope, item: IConcreteItem, variableArgs : ConcreteProcessorVariableArgs)
    {
        variableArgs.namespaceName = null;
        if (this._parserInfo.needNamespaceScope || this._parserInfo.needAppScope)
        {
            if (this._parserInfo.namespaceNameCb) {
                variableArgs.namespaceName = this._parserInfo.namespaceNameCb(item);
            } else {
                variableArgs.namespaceName = item.config.metadata.namespace;
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

    private _postProcessHandler(runtimeData : ConcreteProcessorRuntimeData)
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
