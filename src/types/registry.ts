import { K8sConfig } from "./k8s";

export interface IConcreteRegistry
{
    date: Date;
    filterItems(filter?: ConcreteRegistryFilter | null) : IConcreteItem[];
    debugOutputCapacity() : void;
    add(obj: K8sConfig) : void;
    findItem(id: ItemId) : K8sConfig | null;
}

export interface ConcreteRegistryFilter {
    synthetic?: boolean,
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
}