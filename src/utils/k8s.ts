import _ from 'the-lodash';
import { K8sApiResourceInfo, K8sApiInfo, K8sConfig } from '../types/k8s';

export function parseConfigApiVersion(config: K8sConfig) : K8sApiResourceInfo
{
    const namespaced = _.isNotNullOrUndefined(config.metadata.namespace);

    const result : K8sApiResourceInfo = {
        ...parseApiVersion(config.apiVersion),
        namespaced: namespaced,
        kind: config.kind
    }

    return result;
}

export function parseApiVersion(apiVersion: string) : K8sApiInfo
{
    const parts = apiVersion.split('/');
    
    if (parts.length > 1) {
        return {
            apiName: parts[0],
            version: parts[1],
        }
    } else {
        return {
            version: parts[0],
        }
    }
}