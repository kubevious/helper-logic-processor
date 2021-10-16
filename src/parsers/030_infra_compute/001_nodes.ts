import _ from 'the-lodash';
import { InfraNodesRuntime } from '../../types/parser/infra-nodes'
import { NodeKind } from '@kubevious/entity-meta';
import { InfraParser } from '../../parser-builder/infra';

export default InfraParser()
    .handler(({ logger, item, config, runtime }) => {

        const nodes = item.fetchByNaming(NodeKind.nodes);
        
        (<InfraNodesRuntime>nodes.runtime).poolCount = 0;
        (<InfraNodesRuntime>nodes.runtime).nodeCount = 0;

    })
    ;
