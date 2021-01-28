export interface ConcreteRegistry
{
    filterItems(idFilter: any) : ConcreteItem[];
    debugOutputCapacity() : void;
}

export interface ConcreteItem
{
    id: any
    config: any
}