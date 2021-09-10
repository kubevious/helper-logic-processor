import _ from 'the-lodash';
import { Node, PersistentVolume, PersistentVolumeClaim } from 'kubernetes-types/core/v1';

import { K8sParser } from './';
import { StorageClass } from 'kubernetes-types/storage/v1';
import { InfraStorageClassRuntime } from '../types/parser/infra-storage-class';
import { InfraPersistentVolumeRuntime } from '../types/parser/infra-pv';
import { InfraPersistentVolumeClaimRuntime } from '../types/parser/infra-pvc';

export function K8sStorageClassParser() {

    return K8sParser<StorageClass, InfraStorageClassRuntime>()
        .target({
            clustered: true,
            api: 'storage.k8s.io',
            kind: "StorageClass"
        })
}

export function K8sPersistentVolumeParser() {

    return K8sParser<PersistentVolume, InfraPersistentVolumeRuntime>()
        .target({
            clustered: true,
            kind: "PersistentVolume"
        })
}


export function K8sPersistentVolumeClaimParser() {

    return K8sParser<PersistentVolumeClaim, InfraPersistentVolumeClaimRuntime>()
        .target({
            kind: "PersistentVolumeClaim"
        })
}