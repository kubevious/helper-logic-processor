import _ from 'the-lodash';
import { ClusterRole, ClusterRoleBinding, Role, RoleBinding } from 'kubernetes-types/rbac/v1';
import { Container, PersistentVolumeClaim, Pod, ServiceAccount, Volume } from 'kubernetes-types/core/v1';

import { LogicLauncherRuntime } from '../types/parser/logic-launcher';

import { LogicParser } from './';
import { LogicContainerRuntime } from '../types/parser/logic-container';
import { LogicImageRuntime } from '../types/parser/logic-image';
import { LogicVolumeRuntime } from '../types/parser/logic-volume';
import { LogicPodRuntime } from '../types/parser/logic-pod';
import { LogicAppRuntime } from '../types/parser/logic-app';
import { LogicNamespaceRuntime } from '../types/parser/logic-namespace';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicPvcRuntime } from '../types/parser/logic-pvc';
import { LogicTargetQuery } from '../logic/scope';
import { LogicLinkKind } from '../logic/link-kind';

export function LogicLauncherParser() {

    return LogicParser<any, LogicLauncherRuntime>()
        .target({
            path: [ 
                NodeKind.logic,
                NodeKind.ns,
                NodeKind.app, 
                {
                    query: LogicTargetQuery.link,
                    kind: LogicLinkKind.launcher
                }
            ]
        });
}

export function LogicAppParser() {

    return LogicParser<{}, LogicAppRuntime>()
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app]
        })
}

export function LogicContainerParser() {

    return LogicParser<Container, LogicContainerRuntime>()
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.cont]
        })
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.initcont]
        })
}

export function LogicImageParser() {

    return LogicParser<Container, LogicImageRuntime>()
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.cont, NodeKind.image]
        })
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.initcont, NodeKind.image]
        })
}

export function LogicVolumesParser() {

    return LogicParser<{}, {}>()
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.vols]
        })
}

export function LogicVolumeParser() {

    return LogicParser<Volume, LogicVolumeRuntime>()
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.vols, NodeKind.vol]
        })
}

export function LogicVolumePvcParser() {

    return LogicParser<PersistentVolumeClaim, LogicPvcRuntime>()
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.vols, NodeKind.vol, NodeKind.pvc]
        })
}

export function LogicNetworkPoliciesParser() {

    return LogicParser()
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.netpols]
        })
}


export function LogicPodParser() {

    return LogicParser<Pod, LogicPodRuntime>()    
        .target({
            path: [ 
                NodeKind.logic,
                NodeKind.ns,
                NodeKind.app, 
                {
                    query: LogicTargetQuery.link,
                    kind: LogicLinkKind.launcher
                },
                {
                    query: LogicTargetQuery.node,
                    kind: NodeKind.pod,
                    descendents: true
                },
            ]
        })
}


export function LogicPodPvcParser() {

    return LogicParser<PersistentVolumeClaim, LogicPvcRuntime>()
        .target({
            path: [ 
                NodeKind.logic,
                NodeKind.ns,
                NodeKind.app, 
                {
                    query: LogicTargetQuery.link,
                    kind: LogicLinkKind.launcher
                },
                {
                    query: LogicTargetQuery.node,
                    kind: NodeKind.pvc,
                    descendents: true
                },
            ]
        })
}

export function LogicServiceAccountParser() {

    return LogicParser<ServiceAccount>()
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.svcaccnt]
        });
}

export function LogicBindingParser() {

    return LogicParser<ClusterRoleBinding | RoleBinding>()
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.svcaccnt, NodeKind.rlbndg ]
        })
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.svcaccnt, NodeKind.crlbndg ]
        });
}


export function LogicRoleParser() {

    return LogicParser<ClusterRole | Role>()
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.svcaccnt, NodeKind.rlbndg, NodeKind.rl ]
        })
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.svcaccnt, NodeKind.rlbndg, NodeKind.crl ]
        })
        .target({
            path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.svcaccnt, NodeKind.crlbndg, NodeKind.crl ]
        })
        ;
}

export function LogicNamespaceParser() {

    return LogicParser<{}, LogicNamespaceRuntime>()
        .target({
            path: [ NodeKind.logic, NodeKind.ns ]
        })
}