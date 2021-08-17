import _ from 'the-lodash';
import { ConcreteRegistryFilter, IConcreteItem } from '../../types/registry';

import { BaseParserInfo, BaseParserBuilder } from '../base/builder';

import { ConcreteProcessorHandlerArgs } from './handler-args';

export interface ConcreteParserInfo extends BaseParserInfo
{
    target: null | ConcreteRegistryFilter;

    needAppScope?: boolean;
    canCreateAppIfMissing? : boolean;
    appNameCb?: (item : IConcreteItem) => string;

    kind?: string | ((item: IConcreteItem) => string);

    needNamespaceScope?: boolean;
    namespaceNameCb? : (item : IConcreteItem) => string;

    handler? : (args : ConcreteProcessorHandlerArgs) => void;
}

export function ConcreteParser() : ConcreteParserBuilder
{
    return new ConcreteParserBuilder();
}

export class ConcreteParserBuilder implements BaseParserBuilder
{
    private _data : ConcreteParserInfo = {
        targetKind: 'concrete',
        target: null
    };

    private _targets : (ConcreteRegistryFilter | null)[] = [];

    constructor()
    {
    }

    target(value : null | ConcreteRegistryFilter)
    {
        this._targets.push(value);
        return this;
    }

    needAppScope(value : boolean) : ConcreteParserBuilder
    {
        this._data.needAppScope = value;
        return this;
    }

    canCreateAppIfMissing(value : boolean) : ConcreteParserBuilder
    {
        this._data.canCreateAppIfMissing = value;
        return this;
    }

    appNameCb(value : (item : IConcreteItem) => string) : ConcreteParserBuilder
    {
        this._data.appNameCb = value;
        return this;
    }

    kind(value : string | ((item: IConcreteItem) => string)) : ConcreteParserBuilder
    {
        this._data.kind = value;
        return this;
    }

    needNamespaceScope(value : boolean) : ConcreteParserBuilder
    {
        this._data.needNamespaceScope = value;
        return this;
    }

    namespaceNameCb(value : (item : IConcreteItem) => string) : ConcreteParserBuilder
    {
        this._data.namespaceNameCb = value;
        return this;
    }

    handler(value : (args : ConcreteProcessorHandlerArgs) => void)
    {
        this._data.handler = value;
        return this;
    }

    _extract() : ConcreteParserInfo[]
    {
        return this._targets.map(target => {
            let data = _.clone(this._data);
            data.target = target;
            return data;
        });
    }
}
