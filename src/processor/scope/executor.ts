import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope } from "../../scope";

import { ScopeParserInfo } from './builder'

import { constructArgs, ScopeProcessorHandlerArgs, ScopeProcessorVariableArgs, ScopeProcessorRuntimeData } from './handler-args';

import { BaseParserExecutor } from '../base/executor';
import { ItemScope } from '../../scope/item';
import { NamespaceScope } from '../../scope/namespace';

export class ScopeParserExecutor implements BaseParserExecutor
{
    private _processor : LogicProcessor;
    private _logger : ILogger;
    private _name : string;

    private _parserInfo : ScopeParserInfo;

    constructor(processor : LogicProcessor, name : string, parserInfo : ScopeParserInfo)
    {
        this._name = name;
        this._processor = processor;
        this._logger = processor.logger;
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
        let targets : {
            id: string,
            itemScope: ItemScope,
            namespaceScope: NamespaceScope | null
        }[] = [];

        let targetInfo = this._parserInfo.target!;
        if (targetInfo.namespaced) {
            let namespaces = scope.getNamespaceScopes();
            for(let namespaceScope of namespaces)
            {
                for(let itemScope of namespaceScope.items.getAll(targetInfo.scopeKind))
                {
                    targets.push({
                        id: 'scope-item-' + itemScope.kind + '-' + itemScope.name,
                        itemScope: itemScope,
                        namespaceScope: namespaceScope 
                    })
                }
            }
        } else {
            for(let itemScope of scope.getInfraScope().items.getAll(targetInfo.scopeKind))
            {
                targets.push({
                    id: 'scope-item-' + itemScope.kind + '-' + itemScope.name,
                    itemScope: itemScope,
                    namespaceScope: null 
                })
            }
        }

        for(let target of targets)
        {
            this._processHandler(scope, target.id, target.itemScope, target.namespaceScope);
        }
    }

    _processHandler(scope : LogicScope, id: string, itemScope: ItemScope, namespaceScope: NamespaceScope | null)
    {
        this._logger.silly("[_processHandler] ConcreteHandler: %s, Item: %s", 
            this.name, 
            id);

        let variableArgs : ScopeProcessorVariableArgs =
        {
        };

        let runtimeData : ScopeProcessorRuntimeData = {
            createdItems : [],
            createdAlerts : []
        };

        try
        {
            let handlerArgs = constructArgs(
                this._processor,
                this._parserInfo,
                scope,
                itemScope,
                namespaceScope,
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

    private _postProcessHandler(runtimeData : ScopeProcessorRuntimeData)
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
