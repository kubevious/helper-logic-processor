import { IConcreteItem, IConcreteRegistry } from "../../src"

export class ConcreteRegistry implements IConcreteRegistry
{
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