export interface IConcreteRegistry
{
    filterItems(idFilter: any) : IConcreteItem[];
    debugOutputCapacity() : void;
}

export interface IConcreteItem
{
    id: any
    config: any
}