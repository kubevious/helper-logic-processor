import _ from 'the-lodash';
import { LogicProcessor } from '..';
import { IConcreteRegistry } from '../..';

import { BaseParserInfo, BaseParserBuilder, ParserBuilder } from '../base/builder';
import { BaseParserExecutor } from '../base/executor';
import { ScopeParserExecutor } from './executor';
import { ScopeProcessorHandlerArgs } from './handler-args';

export interface ScopeParserInfo extends BaseParserInfo
{
    target: ScopeTarget | null;

    kind?: string;

    handler? : (args : ScopeProcessorHandlerArgs) => void;
}

interface ScopeTarget {
    namespaced?: boolean,
    scopeKind: string
}

export function ScopeParser() : ScopeParserBuilder
{
    return new ScopeParserBuilder();
}

export class ScopeParserBuilder extends BaseParserBuilder<ScopeTarget> implements ParserBuilder
{
    private _data : ScopeParserInfo = {
        targetKind: 'scope',
        target: null
    };

    target(value : ScopeTarget) : ScopeParserBuilder
    {
        this._targets.push(value);
        return this;
    }

    kind(value : string) : ScopeParserBuilder
    {
        this._data.kind = value;
        return this;
    }

    handler(value : (args : ScopeProcessorHandlerArgs) => void)
    {
        this._data.handler = value;
        return this;
    }

    _extract(registry: IConcreteRegistry, processor : LogicProcessor, name: string) : BaseParserExecutor[]
    {
        return this._targets.map(target => {
            let parserInfo = _.clone(this._data);
            parserInfo.target = target;

            let executor = new ScopeParserExecutor(
                processor,
                name,
                parserInfo)

            return executor;
        });
    }
}
