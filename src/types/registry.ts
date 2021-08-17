import { K8sConfig } from "./k8s";

export interface IConcreteRegistry
{
    date: Date;
    filterItems(filter?: ConcreteRegistryFilter | null) : IConcreteItem[];
    debugOutputCapacity() : void;
}

export interface ConcreteRegistryFilter {
    api?: string,
    apiName?: string | null,
    version?: string,
    kind?: string
}

export interface IConcreteItem
{
    id: ItemId
    config: K8sConfig
}

export interface ItemId {
    synthetic?: boolean
    infra: string,
    api: string,
    apiName: string | null,
    version: string,
    kind: string,
    namespace?: string, 
    name: string,
};
