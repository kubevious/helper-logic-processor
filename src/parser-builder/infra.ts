import _ from 'the-lodash';
import { Node } from 'kubernetes-types/core/v1';

import { LogicParser } from './';
import { InfraNodeRuntime } from '../types/parser/infra-node'
import { InfraNodesRuntime } from '../types/parser/infra-nodes'
import { InfraPoolRuntime } from '../types/parser/infra-pool';
import { InfraStorageRuntime } from '../types/parser/infra-storage';
import { InfraStorageClassRuntime } from '../types/parser/infra-storage-class';
import { NodeKind } from '@kubevious/entity-meta';

export function InfraParser() {

    return LogicParser()
        .target({
            path: [ NodeKind.infra]
        });
}

export function InfraNodeParser() {

    return LogicParser<Node, InfraNodeRuntime>()
        .target({
            path: [ NodeKind.infra, NodeKind.nodes, NodeKind.pool, NodeKind.node]
        });
}

export function InfraNodePoolParser() {

    return LogicParser<{}, InfraPoolRuntime>()
        .target({
            path: [ NodeKind.infra, NodeKind.nodes, NodeKind.pool]
        });
}

export function InfraNodesParser() {

    return LogicParser<{}, InfraNodesRuntime>()
        .target({
            path: [ NodeKind.infra, NodeKind.nodes]
        });
}

export function InfraStorageParser() {

    return LogicParser<{}, InfraStorageRuntime>()
        .target({
            path: [ NodeKind.infra, NodeKind.storage]
        });
}

export function InfraStorageClassParser() {

    return LogicParser<{}, InfraStorageClassRuntime>()
        .target({
            path: [ NodeKind.infra, NodeKind.storage, NodeKind.storclass]
        });
}