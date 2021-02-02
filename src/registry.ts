export interface IConcreteRegistry
{
    date: Date;
    filterItems(idFilter: any) : IConcreteItem[];
    debugOutputCapacity() : void;
}

export interface IConcreteItem
{
    id: any
    config: any
}