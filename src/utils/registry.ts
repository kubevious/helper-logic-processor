import _ from 'the-lodash';
import { K8sConfig } from '../types/k8s';
import { ItemId } from '../types/registry';
import { parseConfigApiVersion } from './k8s';

export function extractK8sConfigId(config: K8sConfig) : ItemId
{
    const apiInfo = parseConfigApiVersion(config);

    let itemId : ItemId = {
        infra: 'k8s',
        api: config.apiVersion,
        apiName: apiInfo.apiName || null,
        version: apiInfo.version,
        kind: apiInfo.kind,
        name: config.metadata!.name!
    }
    if (config.metadata.namespace) {
        itemId.namespace = config.metadata.namespace!;
    }
    if (config.synthetic) {
        itemId.synthetic = true;
    }
    return itemId;
}