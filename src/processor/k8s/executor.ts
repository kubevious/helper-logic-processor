import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope } from "../../scope";

import { K8sParserInfo } from './builder'

import { BaseParserExecutor } from '../base/executor';

import { LogicParserExecutor } from '../logic/executor';
import { LogicParserInfo, LogicTargetPathElement } from '../logic/builder';
import { LogicProcessorHandlerArgs } from '../logic/handler-args';
import { K8sProcessorHandlerArgs } from './handler-args';
import { K8sConfig } from '../..';

export class K8sParserExecutor<TConfig> implements BaseParserExecutor
{
    private _logger : ILogger;
    private _name : string;

    private _targetPath : LogicTargetPathElement[];

    private _innerExecutor : LogicParserExecutor;

    private _handler? : (args : K8sProcessorHandlerArgs<TConfig>) => void;

    constructor(processor : LogicProcessor, name : string, parserInfo : K8sParserInfo<TConfig>)
    {
        this._name = name;
        this._logger = processor.logger;
        this._handler = parserInfo.handler;

        this._targetPath = [
            { kind: 'k8s'},
        ]

        if (parserInfo.target!.clustered)
        { 
            this._targetPath.push({ kind: 'cluster' });
        }
        else
        {
            this._targetPath.push({ kind: 'ns' });
        }

        if (parserInfo.target!.api)
        {
            this._targetPath.push({ kind: 'api', name: parserInfo.target!.api });
        }

        if (parserInfo.target!.version)
        {
            this._targetPath.push({ kind: 'version', name: parserInfo.target!.version });
        } else {
            this._targetPath.push({ kind: 'version' });
        }

        this._targetPath.push({ kind: 'kind', name: parserInfo.target!.kind });

        this._targetPath.push({ kind: 'resource' });


        const logicParserInfo : LogicParserInfo = {
            target: { path: this._targetPath },

            targetKind: 'unused',

            handler: this._innerHandler.bind(this)
        }

        this._innerExecutor = new LogicParserExecutor(processor, name, logicParserInfo);
    }

    get kind() {
        return 'K8s';
    }

    get name() : string {
        return this._name;
    }

    get targetInfo() : string {
        return _.stableStringify(this._targetPath);
    }

    execute(scope : LogicScope)
    {
        return this._innerExecutor.execute(scope);
    }

    private _innerHandler(args : LogicProcessorHandlerArgs)
    {
        if (!this._handler) {
            return;
        }

        const metadata = (<K8sConfig>args.item.config).metadata || {};
        
        this._handler({
            logger : args.logger,
            scope : args.scope,
            item: args.item,
            config: <TConfig>args.item.config,
            helpers : args.helpers,

            metadata: metadata,
            namespace : metadata.namespace || null
        })
    }
}