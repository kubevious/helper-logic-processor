import _ from 'the-lodash';
import { Node, PersistentVolume, PersistentVolumeClaim, Secret, ServiceAccount } from 'kubernetes-types/core/v1';

import { K8sParser } from './';
import { StorageClass } from 'kubernetes-types/storage/v1';
import { InfraStorageClassRuntime } from '../types/parser/infra-storage-class';
import { InfraPersistentVolumeRuntime } from '../types/parser/infra-pv';
import { InfraPersistentVolumeClaimRuntime } from '../types/parser/infra-pvc';
import { ClusterRole, ClusterRoleBinding, Role, RoleBinding } from 'kubernetes-types/rbac/v1';
import { LogicRoleBindingRuntime, LogicServiceAccountRuntime } from '../types/parser/logic-rbac';

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


export function K8sRoleBindingParser() {

    return K8sParser<ClusterRoleBinding | RoleBinding, LogicRoleBindingRuntime>()
        .target({
            clustered: true,
            api: "rbac.authorization.k8s.io",
            kind: "ClusterRoleBinding"
        })
        .target({
            api: "rbac.authorization.k8s.io",
            kind: "RoleBinding"
        })
}

export function K8sRoleParser() {

    return K8sParser<ClusterRole | Role>()
        .target({
            clustered: true,
            api: "rbac.authorization.k8s.io",
            kind: "ClusterRole"
        })
        .target({
            api: "rbac.authorization.k8s.io",
            kind: "Role"
        })
}


export function K8sServiceAccountParser() {

    return K8sParser<ServiceAccount, LogicServiceAccountRuntime>()
        .target({
            kind: "ServiceAccount"
        })  
}


export function K8sSecretParser() {

    return K8sParser<Secret, {}>()
        .target({
            kind: "Secret"
        })  
}

