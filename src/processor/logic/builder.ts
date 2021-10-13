import _ from 'the-lodash';
import { LogicProcessor } from '..';
import { IConcreteRegistry } from '../..';
import { LogicTarget } from '../../logic/scope';

import { BaseParserInfo, ParserBuilder, BaseParserBuilder } from '../base/builder';
import { BaseParserExecutor } from '../base/executor';
import { LogicParserExecutor } from './executor';

import { LogicProcessorHandlerArgs } from './handler-args';

export interface LogicParserInfo<TConfig, TRuntime> extends BaseParserInfo
{
    target?: LogicTarget;

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

    handler(value : (args : LogicProcessorHandlerArgs<TConfig, TRuntime>) => void)
    {
        this._data.handler = value;
        return this;
    }

    _extract(registry: IConcreteRegistry, processor : LogicProcessor, name: string) : BaseParserExecutor[]
    {
        return this._targets.map(target => {
            const parserInfo = _.clone(this._data);
            parserInfo.target = target;

            const executor = new LogicParserExecutor(
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
