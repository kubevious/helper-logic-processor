import _ from 'the-lodash';
// import { IConcreteItem } from '../../../concrete/item';

import { BaseParserInfo, BaseParserBuilder } from '../base/builder';
import { ScopeProcessorHandlerArgs } from './handler-args';

// import { ConcreteProcessorHandlerArgs } from './handler-args';

export interface ScopeParserInfo extends BaseParserInfo
{
    target: ScopeTarget | null;

    // needAppScope?: boolean;
    // canCreateAppIfMissing? : boolean;
    // appNameCb?: (item : IConcreteItem) => string;

    kind?: string;

    // needNamespaceScope?: boolean;
    // namespaceNameCb? : (item : IConcreteItem) => string;

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

export class ScopeParserBuilder implements BaseParserBuilder
{
    private _data : ScopeParserInfo = {
        targetKind: 'scope',
        order: 0,
        target: null
    };

    private _targets : ScopeTarget[] = [];

    constructor()
    {
    }

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

    order(value : number) : ScopeParserBuilder
    {
        this._data.order = value;
        return this;
    }

    handler(value : (args : ScopeProcessorHandlerArgs) => void)
    {
        this._data.handler = value;
        return this;
    }

    _extract() : ScopeParserInfo[]
    {
        return this._targets.map(target => {
            let data = _.clone(this._data);
            data.target = target;
            return data;
        });
    }
}
