import _ from 'the-lodash';
import { ILogger } from 'the-logger';

export class PersistenceStore
{
    private _logger : ILogger;
    private _data : Record<string, Record<string, any>> = {};

    constructor(logger : ILogger)
    {
        this._logger = logger;
    }

    loadItems(data: PersistenceItem[])
    {
        for(const row of data)
        {
            this.setValue(row.dn, row.key, row.value);
        }
    }

    exportItems() : PersistenceItem[]
    {
        const items : PersistenceItem[] = [];
        for(const dn of _.keys(this._data))
        {
            const dict = this._data[dn];
            for(const key of _.keys(dict))
            {
                items.push({
                    dn: dn,
                    key: key,
                    value: dict[key]
                })
            }
        }
        return items;
    }

    getValue(dn: string, key: string) 
    {
        return this._data[key] ?? null;
    }

    setValue(dn: string, key: string, value: any)
    {
        if (_.isNullOrUndefined(value))
        {
            const dict = this._data[dn];
            if (dict) {
                delete dict[key];
                if (_.keys(dict).length === 0)
                {
                    delete this._data[dn];
                }
            }
        }
        else
        {
            if (!this._data[dn]) {
                this._data[dn] = {}
            }
            this._data[dn][key] = value;
        }
    }
}

export interface PersistenceItem 
{
    dn: string,
    key: string,
    value: any
}