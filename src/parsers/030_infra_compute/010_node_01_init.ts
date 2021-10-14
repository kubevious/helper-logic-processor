import { Node } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { InfraPoolRuntime } from '../../types/parser/infra-pool';
import { NodeKind } from '@kubevious/entity-meta';

export default K8sParser<Node>()
    .target({
        clustered: true,
        kind: "Node"
    })
    .handler(({ logger, scope, config, item, metadata, helpers }) => {

        const nodePoolName = getNodePoolName();

        const root = scope.logicRootNode.fetchByNaming(NodeKind.infra);
        const nodes = root.fetchByNaming(NodeKind.nodes);

        const pool = nodes.fetchByNaming(NodeKind.pool, nodePoolName);
        (<InfraPoolRuntime>pool.runtime).nodeCount = 0;

        const node = pool.fetchByNaming(NodeKind.node, metadata.name!);
        node.makeShadowOf(item);

        /*** HELPERS ***/
        function getNodePoolName()
        {
            const labelMap = metadata.labels ?? {};
            for(let label of NODE_POOL_LABELS) {
                const value = labelMap[label];
                if (value) {
                    return value;
                }
            }
            return 'default';
        }

    })
    ;


const NODE_POOL_LABELS = [
    'cloud.google.com/gke-nodepool',
    'eks.amazonaws.com/nodegroup',
    'kops.k8s.io/instancegroup'
]