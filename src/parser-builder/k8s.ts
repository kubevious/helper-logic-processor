import _ from 'the-lodash';
import { PersistentVolume, PersistentVolumeClaim, Secret, Service, ServiceAccount, Pod } from 'kubernetes-types/core/v1';

import { K8sParser, LogicParser } from './';
import { StorageClass } from 'kubernetes-types/storage/v1';
import { InfraStorageClassRuntime } from '../types/parser/infra-storage-class';
import { InfraPersistentVolumeRuntime } from '../types/parser/infra-pv';
import { InfraPersistentVolumeClaimRuntime } from '../types/parser/infra-pvc';
import { K8sServiceRuntime } from '../types/parser/k8s-service';
import { ClusterRole, ClusterRoleBinding, Role, RoleBinding } from 'kubernetes-types/rbac/v1';
import { LogicRoleBindingRuntime, LogicServiceAccountRuntime } from '../types/parser/logic-rbac';
import { NodeKind } from '@kubevious/entity-meta';
import { K8sConfig } from '../types/k8s';
import { Node } from 'kubernetes-types/core/v1';
import { K8sPodRuntime } from '../types/parser/k8s-pod';

export function K8sNodeParser() {

    return K8sParser<Node>()
        .target({
            clustered: true,
            kind: "Node"
        })
}

export function K8sPodParser() {
    return K8sParser<Pod, K8sPodRuntime>()
        .target({
            kind: "Pod"
        });
}

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

export function K8sServiceParser() {

    return K8sParser<Service, K8sServiceRuntime>()
        .target({
            kind: "Service"
        })
}

export function K8sAllParser() {

    return LogicParser<K8sConfig>()
        .target({
            path: [ NodeKind.k8s, NodeKind.cluster, NodeKind.api, NodeKind.version, NodeKind.kind, NodeKind.resource ]
        })
        .target({
            path: [ NodeKind.k8s, NodeKind.cluster, NodeKind.version, NodeKind.kind, NodeKind.resource ]
        })
        .target({
            path: [ NodeKind.k8s, NodeKind.ns, NodeKind.api, NodeKind.version, NodeKind.kind, NodeKind.resource ]
        })
        .target({
            path: [ NodeKind.k8s, NodeKind.ns, NodeKind.version, NodeKind.kind, NodeKind.resource ]
        })

}