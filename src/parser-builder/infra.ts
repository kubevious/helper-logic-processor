import _ from 'the-lodash';
import { Node } from 'kubernetes-types/core/v1';

import { LogicParser } from './';

export function InfraNodeParser() {

    return LogicParser<Node>()
        .target({
            path: ["infra", "nodes", "pool", "node"]
        });
}

export function InfraNodePoolParser() {

    return LogicParser()
        .target({
            path: ["infra", "nodes", "pool"]
        });
}
