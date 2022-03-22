import _ from 'the-lodash';

import { LogicParser } from './';
import { NodeKind } from '@kubevious/entity-meta';

import { RbacGroupRuntime, RbacUserRuntime } from '../types/parser/rbac';

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
