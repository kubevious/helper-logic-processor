import _ from 'the-lodash';
import { ILogger } from 'the-logger';

export class PersistenceStore
{
    private _logger : ILogger;
    private _data : Record<string, any> = {};

    constructor(logger : ILogger)
    {
        this._logger = logger;
    }

    loadValues(data: {key: string, value: any}[])
    {
        for(const row of data)
        {
            this._data[row.key] = row.value;
        }
    }

    getValue(key: string) 
    {
        return this._data[key] ?? null;
    }

    setValue(key: string, value: any)
    {
        if (_.isNullOrUndefined(value)) {
            delete this._data[key];
        } else {
            this._data[key] = value;
        }
    }
}