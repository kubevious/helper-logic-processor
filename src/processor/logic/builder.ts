import _ from 'the-lodash';
import { LogicProcessor } from '..';
import { IConcreteRegistry } from '../..';
import { LogicItem } from '../../item';
import { LogicTarget } from '../../scope';

import { BaseParserInfo, ParserBuilder, BaseParserBuilder } from '../base/builder';
import { BaseParserExecutor } from '../base/executor';
import { LogicParserExecutor } from './executor';

import { LogicProcessorHandlerArgs } from './handler-args';

export interface LogicParserInfo<TConfig, TRuntime> extends BaseParserInfo
{
    target?: LogicTarget;

    needAppScope?: boolean;
    canCreateAppIfMissing? : boolean;
    appNameCb?: (item : LogicItem) => string;

    kind?: string,

    needNamespaceScope?: boolean;
    namespaceNameCb? : (item : LogicItem) => string;

    handler? : (args : LogicProcessorHandlerArgs<TConfig, TRuntime>) => void;
}

export class LogicParserBuilder<TConfig, TRuntime> extends BaseParserBuilder<LogicTarget> implements ParserBuilder
{
    private _data : LogicParserInfo<TConfig, TRuntime> = {
        targetKind: 'logic'
    };


    target(value : LogicTarget) 
    {
        this._targets.push(value);
        return this;
    }

    needNamespaceScope(value : boolean)
    {
        this._data.needNamespaceScope = value;
        return this;
    }

    namespaceNameCb(value : (item : LogicItem) => string)
    {
        this._data.namespaceNameCb = value;
        return this;
    }

    kind(value : string)
    {
        this._data.kind = value;
        return this;
    }

    handler(value : (args : LogicProcessorHandlerArgs<TConfig, TRuntime>) => void)
    {
        this._data.handler = value;
        return this;
    }

    _extract(registry: IConcreteRegistry, processor : LogicProcessor, name: string) : BaseParserExecutor[]
    {
        return this._targets.map(target => {
            let parserInfo = _.clone(this._data);
            parserInfo.target = target;

            let executor = new LogicParserExecutor(
                processor,
                name,
                parserInfo,
                this.isTraceEnabled(),
                this.isDnTraceEnabled.bind(this)
                )

            return executor;
        });
    }

}
