import _ from 'the-lodash';
import { DaemonSet, Deployment, StatefulSet } from 'kubernetes-types/apps/v1';
import { Job } from 'kubernetes-types/batch/v1';
import { ClusterRole, ClusterRoleBinding, Role, RoleBinding } from 'kubernetes-types/rbac/v1';
import { Container, PersistentVolumeClaim, Pod, ServiceAccount, Volume } from 'kubernetes-types/core/v1';

import { LogicLauncherRuntime } from '../types/parser/logic-launcher';

import { LogicParser } from './';
import { LogicContainerRuntime } from '../types/parser/logic-container';
import { LogicVolumeRuntime } from '../types/parser/logic-volume';
import { LogicPodRuntime } from '../types/parser/logic-pod';
import { LogicAppRuntime } from '../types/parser/logic-app';
import { LogicNamespaceRuntime } from '../types/parser/logic-namespace';

export function LogicLauncherParser() {

    return LogicParser<Deployment | DaemonSet | StatefulSet | Job, LogicLauncherRuntime>()
        .target({
            path: ["logic", "ns", "app", "launcher"]
        });
}

export function LogicAppParser() {

    return LogicParser<{}, LogicAppRuntime>()
        .target({
            path: ["logic", "ns", "app"]
        })
}

export function LogicContainerParser() {

    return LogicParser<Container, LogicContainerRuntime>()
        .target({
            path: ["logic", "ns", "app", "cont"]
        })
        .target({
            path: ["logic", "ns", "app", "initcont"]
        })
}

export function LogicVolumesParser() {

    return LogicParser<{}, {}>()
        .target({
            path: ["logic", "ns", "app", "vols"]
        })
}

export function LogicVolumeParser() {

    return LogicParser<Volume, LogicVolumeRuntime>()
        .target({
            path: ["logic", "ns", "app", "vols", "vol"]
        })
}

export function LogicNetworkPoliciesParser() {

    return LogicParser()
        .target({
            path: ["logic", "ns", "app", "netpols"]
        })
}


export function LogicPodParser() {

    return LogicParser<Pod, LogicPodRuntime>()
        .target({
            path: ["logic", "ns", "app", "launcher", "replicaset", "pod"]
        })
        .target({
            path: ["logic", "ns", "app", "launcher", "pod"]
        })
}


export function LogicPodPvcParser() {

    return LogicParser<PersistentVolumeClaim, LogicPodRuntime>()
        .target({
            path: ["logic", "ns", "app", "launcher", "replicaset", "pod", "pvc"]
        })
        .target({
            path: ["logic", "ns", "app", "launcher", "pod", "pvc"]
        })
}

export function LogicServiceAccountParser() {

    return LogicParser<ServiceAccount>()
        .target({
            path: ["logic", "ns", "app", "svcaccnt"]
        });
}

export function LogicBindingParser() {

    return LogicParser<ClusterRoleBinding | RoleBinding>()
        .target({
            path: ["logic", "ns", "app", "svcaccnt", "rlbndg" ]
        })
        .target({
            path: ["logic", "ns", "app", "svcaccnt", "crlbndg" ]
        });
}


export function LogicRoleParser() {

    return LogicParser<ClusterRole | Role>()
        .target({
            path: ["logic", "ns", "app", "svcaccnt", "rlbndg", "rl" ]
        })
        .target({
            path: ["logic", "ns", "app", "svcaccnt", "rlbndg", "crl" ]
        })
        .target({
            path: ["logic", "ns", "app", "svcaccnt", "crlbndg", "crl" ]
        })
        ;
}

export function LogicNamespaceParser() {

    return LogicParser<{}, LogicNamespaceRuntime>()
        .target({
            path: ["logic", "ns"]
        })
}