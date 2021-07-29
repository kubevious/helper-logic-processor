import _ from 'the-lodash';
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
    api: string | null,
    version: string,
    kind: string,
    namespace?: string, 
    name: string,
};
export interface K8sConfig {
    synthetic?: boolean,
    apiVersion: string,
    kind: string,
    metadata: {
        name: string,
        namespace?: string,
        [x: string]: any,
    },
    [x: string]: any
}

export function extractK8sConfigId(config: K8sConfig) : ItemId
{
    const parts = config.apiVersion.split('/');

    let itemId : ItemId = {
        infra: 'k8s',
        api: (parts.length > 1) ? _.head(parts)! : null,
        version: _.last(parts)!,
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