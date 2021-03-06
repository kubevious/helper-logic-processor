import _ from 'the-lodash';
import { ILogger } from 'the-logger';
import { IConcreteItem } from '../registry';
import { ItemScope } from './item';

export class ItemsScope
{
    private _parent : any;
    private _logger : ILogger;

    private _itemsDict : Record<string, Record<string, ItemScope> > = {}

    constructor(parent: any)
    {
        this._parent = parent;
        this._logger = parent.logger;
    }

    get logger() {
        return this._logger;
    }
    
    register(config : any)
    {
        return this._register(config.kind, config.metadata.name, config);
    }

    _register(kind: string, name: string, config: any)
    {
        if (!this._itemsDict[kind])
        {
            this._itemsDict[kind] = {};
        }
        var item = new ItemScope(this._parent, kind, name, config);
        this._itemsDict[kind][name] = item;
        return item;
    }
    
    fetch(kind: string, name: string, config: any) : ItemScope
    {
        let item = this._get(kind, name);
        if (!item) {
            item = this._register(kind, name, config);
        }
        return item;
    }

    get(kind: string, name: string) : ItemScope | null
    {
        return this._get(kind, name);
    }

    getByConcrete(item : IConcreteItem) : ItemScope | null
    {
        return this.get(item.config.kind, item.config.metadata.name);;
    }

    getAll(kind: string) : ItemScope[]
    {
        if (this._itemsDict[kind])
        {
            return _.values(this._itemsDict[kind]);
        }
        return [];
    }

    finalize()
    {
        for(var kindDict of _.values(this._itemsDict))
        {
            for(var scopeItem of _.values(kindDict))
            {
                scopeItem.finalize();
            }
        }
    }

    count(kind: string)
    {
        return this.getAll(kind).length;
    }

    _get(kind: string, name: string) : ItemScope | null
    {
        if (this._itemsDict[kind])
        {
            var value = this._itemsDict[kind][name];
            if (value)
            {
                return value;
            }
        }
        return null;
    }
}
