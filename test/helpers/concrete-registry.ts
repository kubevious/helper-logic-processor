import { IConcreteItem, IConcreteRegistry } from "../../src"

export class ConcreteRegistry implements IConcreteRegistry
{
    private _date : Date;
    
    constructor()
    {
        this._date = new Date();
    }

    get date() {
        return this._date;
    }

    filterItems(idFilter: any) : IConcreteItem[]
    {
        return []
    }

    debugOutputCapacity() : void
    {

    }
}

export class ConcreteItem implements IConcreteItem
{
    id: any
    config: any
}