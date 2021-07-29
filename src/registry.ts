export interface IConcreteRegistry
{
    date: Date;
    filterItems(idFilter: any) : IConcreteItem[];
    debugOutputCapacity() : void;
}

export interface IConcreteItem
{
    id: ItemId
    config: any
}

export interface ItemId {
    synthetic?: boolean
    infra: string,
    api: string,
    kind: string,
    namespace?: string, 
    name: string,
};
export interface K8sConfig {
    synthetic?: boolean
    apiVersion: string
    kind: string
    metadata: {
        name: string
        namespace?: string
    }
}

export function extractK8sConfigId(config: K8sConfig) : ItemId
{
    let itemId : ItemId = {
        infra: 'k8s',
        api: config.apiVersion.split('/')[0],
        kind: config.kind,
        name: config.metadata.name
    }
    if (config.metadata.namespace) {
        itemId.namespace = config.metadata.namespace!;
    }
    if (config.synthetic) {
        itemId.synthetic = true;
    }
    return itemId;
}