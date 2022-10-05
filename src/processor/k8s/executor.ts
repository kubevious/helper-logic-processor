import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicProcessor } from '../';

import { LogicScope, LogicTargetPathElement, LogicTargetQuery } from "../../logic/scope";

import { K8sParserInfo } from './builder'

import { BaseParserExecutor } from '../base/executor';

import { LogicParserExecutor } from '../logic/executor';
import { LogicParserInfo } from '../logic/builder';
import { LogicProcessorHandlerArgs } from '../logic/handler-args';
import { K8sProcessorHandlerArgs } from './handler-args';
import { K8sConfig } from '../..';
import { Helpers } from '../../helpers';

import { makeLogicTargetPath } from './helpers';

export class K8sParserExecutor<TConfig, TRuntime> implements BaseParserExecutor
{
    private _logger : ILogger;
    private _name : string;

    private _targetPath : LogicTargetPathElement[];
    
    private _innerExecutor : LogicParserExecutor<TConfig, TRuntime>;

    private _handler? : (args : K8sProcessorHandlerArgs<TConfig, TRuntime>) => void;

    constructor(processor : LogicProcessor,
        name : string,
        parserInfo : K8sParserInfo<TConfig, TRuntime>,
        isTraceEnabled: boolean,
        isDnTraceEnabledCb: (dn: string) => boolean)
    {
        this._name = name;
        this._logger = processor.parserLogger;
        this._handler = parserInfo.handler;

        this._targetPath = makeLogicTargetPath(parserInfo.target!);

        const logicParserInfo : LogicParserInfo<TConfig, TRuntime> = {
            target: { path: this._targetPath! },

            targetKind: 'unused',

            handler: this._innerHandler.bind(this)
        }

        this._innerExecutor = new LogicParserExecutor(processor, name, logicParserInfo, isTraceEnabled, isDnTraceEnabledCb);
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

    execute(scope : LogicScope, helpers: Helpers)
    {
        return this._innerExecutor.execute(scope, helpers);
    }

    private _innerHandler(args : LogicProcessorHandlerArgs<TConfig, TRuntime>)
    {
        if (!this._handler) {
            return;
        }

        const metadata = (<K8sConfig>args.item.config).metadata || {};
        
        this._handler({
            logger : args.logger,
            scope : args.scope,
            item: args.item,
            config: args.config,
            runtime: args.runtime,
            helpers : args.helpers,

            metadata: metadata,
            namespace : metadata.namespace || null
        })
    }
}