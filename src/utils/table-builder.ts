import _ from 'the-lodash';
export class TableBuilder
{
    private _headers: (string | { id: string, label? : string, kind? : string })[] = [];
    private _rows: Record<string, any>[] = [];

    constructor()
    {

    }

    column(id: string, label? : string, kind? : string)
    {
        if (label && kind)
        {
            this._headers.push({
                id: id,
                label: label,
                kind: kind
            });
        }
        else
        {
            this._headers.push(id);
        }
        return this;
    }

    row(data: Record<string, any>)
    {
        this._rows.push(data);
        return this;
    }

    get rowCount() : number {
        return this._rows.length;
    }

    get hasRows() : boolean {
        return this._rows.length > 0;
    }

    order(columns: string[], orders?: ("asc"|"desc")[])
    {
        this._rows = _.orderBy(this._rows, columns, orders);
    }

    extract() {
        return {
            headers: this._headers,
            rows: this._rows
        }
    }
}

