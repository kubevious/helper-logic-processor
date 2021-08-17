import _ from 'the-lodash';
import { K8sApiInfo, K8sConfig } from '../types/k8s';

export function parseApiVersion(config: K8sConfig) : K8sApiInfo
{
    const parts = config.apiVersion.split('/');
    
    const namespaced = _.isNotNullOrUndefined(config.metadata.namespace);

    if (parts.length > 1) {
        return {
            namespaced: namespaced,
            apiName: parts[0],
            version: parts[1],
            kind: config.kind
        }
    } else {
        return {
            namespaced: namespaced,
            version: parts[0],
            kind: config.kind
        }
    }
}