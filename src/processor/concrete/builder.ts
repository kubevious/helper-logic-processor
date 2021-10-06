import _ from 'the-lodash';
import { LogicProcessor } from '..';
import { ConcreteRegistryFilter, IConcreteRegistry } from '../../types/registry';

import { BaseParserInfo, ParserBuilder, BaseParserBuilder } from '../base/builder';
import { BaseParserExecutor } from '../base/executor';
import { ConcreteParserExecutor } from './executor';

import { ConcreteProcessorHandlerArgs } from './handler-args';

export interface ConcreteParserInfo extends BaseParserInfo
{
    target: null | ConcreteRegistryFilter;

    handler? : (args : ConcreteProcessorHandlerArgs) => void;
}

export function ConcreteParser() : ConcreteParserBuilder
{
    return new ConcreteParserBuilder();
}

export class ConcreteParserBuilder extends BaseParserBuilder<ConcreteRegistryFilter | null> implements ParserBuilder
{
    private _data : ConcreteParserInfo = {
        targetKind: 'concrete',
        target: null
    };

    target(value : ConcreteRegistryFilter | null)
    {
        this._targets.push(value);
        return this;
    }

    handler(value : (args : ConcreteProcessorHandlerArgs) => void)
    {
        this._data.handler = value;
        return this;
    }

    _extract(registry: IConcreteRegistry, processor : LogicProcessor, name: string) : BaseParserExecutor[]
    {
        return this._targets.map(target => {
            let parserInfo = _.clone(this._data);
            parserInfo.target = target;

            let executor = new ConcreteParserExecutor(
                registry,
                processor,
                name,
                parserInfo)
                
            return executor;
        });
    }
}
