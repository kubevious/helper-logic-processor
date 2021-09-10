import _ from 'the-lodash';
import { Node } from 'kubernetes-types/core/v1';

import { LogicParser } from './';
import { InfraNodeRuntime } from '../types/parser/infra-node'
import { InfraNodesRuntime } from '../types/parser/infra-nodes'
import { InfraPoolRuntime } from '../types/parser/infra-pool';
import { InfraStorageRuntime } from '../types/parser/infra-storage';

export function InfraNodeParser() {

    return LogicParser<Node, InfraNodeRuntime>()
        .target({
            path: ["infra", "nodes", "pool", "node"]
        });
}

export function InfraNodePoolParser() {

    return LogicParser<{}, InfraPoolRuntime>()
        .target({
            path: ["infra", "nodes", "pool"]
        });
}

export function InfraNodesParser() {

    return LogicParser<{}, InfraNodesRuntime>()
        .target({
            path: ["infra", "nodes"]
        });
}

export function InfraStorageParser() {

    return LogicParser<{}, InfraStorageRuntime>()
        .target({
            path: ["infra", "storage"]
        });
}