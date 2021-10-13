import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { InfraNodesRuntime } from '../../types/parser/infra-nodes'
import { NodeKind } from '@kubevious/entity-meta';

export default LogicParser()
    .target({
        path: ["infra"]
    })
    .handler(({ logger, item, config, runtime }) => {

        const nodes = item.fetchByNaming(NodeKind.nodes);
        
        (<InfraNodesRuntime>nodes.runtime).poolCount = 0;
        (<InfraNodesRuntime>nodes.runtime).nodeCount = 0;

    })
    ;
