import _ from 'the-lodash';

import { LogicParser } from './';
import { NodeKind } from '@kubevious/entity-meta';

import { RbacGroupRuntime, RbacUserRuntime } from '../types/parser/rbac';
import { ClusterRoleBinding, RoleBinding } from 'kubernetes-types/rbac/v1';

export function RbacGroupParser() {

    return LogicParser<any, RbacGroupRuntime>()
        .target({
            path: [ NodeKind.rbac, NodeKind.group ]
        });
}

export function RbacUserParser() {

    return LogicParser<any, RbacUserRuntime>()
        .target({
            path: [ NodeKind.rbac, NodeKind.user ]
        });
}

export function RbacGroupOrUserParser() {

    return LogicParser<any, RbacGroupRuntime | RbacUserRuntime>()
        .target({
            path: [ NodeKind.rbac, NodeKind.group ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.user ]
        })
        ;
}

export function RbacGroupOrUserBindingParser() {

    return LogicParser<ClusterRoleBinding | RoleBinding>()
        .target({
            path: [ NodeKind.rbac, NodeKind.group, NodeKind.crlbndg ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.group, NodeKind.rlbndg ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.user, NodeKind.crlbndg ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.user, NodeKind.rlbndg ]
        })
        ;
}

export function RbacGroupOrUserRoleParser() {

    return LogicParser<ClusterRoleBinding | RoleBinding>()
        .target({
            path: [ NodeKind.rbac, NodeKind.group, NodeKind.crlbndg, NodeKind.crl ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.group, NodeKind.rlbndg, NodeKind.crl ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.user, NodeKind.crlbndg, NodeKind.crl ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.user, NodeKind.rlbndg, NodeKind.crl ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.group, NodeKind.crlbndg, NodeKind.rl ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.group, NodeKind.rlbndg, NodeKind.rl ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.user, NodeKind.crlbndg, NodeKind.rl ]
        })
        .target({
            path: [ NodeKind.rbac, NodeKind.user, NodeKind.rlbndg, NodeKind.rl ]
        })        
        ;
}
