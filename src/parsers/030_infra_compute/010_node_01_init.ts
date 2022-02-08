
import _ from 'the-lodash';
import { InfraPoolRuntime } from '../../types/parser/infra-pool';
import { NodeKind } from '@kubevious/entity-meta';
import { K8sNodeParser } from '../../parser-builder/k8s';

export default K8sNodeParser()
    .handler(({ logger, scope, config, item, metadata, helpers }) => {

        const nodePoolName = getNodePoolName();

        const root = scope.logicRootNode.fetchByNaming(NodeKind.infra);
        const nodes = root.fetchByNaming(NodeKind.nodes);

        const pool = nodes.fetchByNaming(NodeKind.pool, nodePoolName);
        (<InfraPoolRuntime>pool.runtime).nodeCount = 0;

        helpers.shadow.create(item, pool,
            {
                kind: NodeKind.node,
                linkName: 'k8s',
                inverseLinkName: 'infra'
            })

        /*** HELPERS ***/
        function getNodePoolName()
        {
            const labelMap = metadata.labels ?? {};
            for(const label of NODE_POOL_LABELS) {
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
    'kops.k8s.io/instancegroup',
    'kubernetes.azure.com/agentpool'
]