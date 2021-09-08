import { Node } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';


export default K8sParser<Node>()
    .target({
        clustered: true,
        kind: "Node"
    })
    .handler(({ logger, scope, config, item, metadata, helpers }) => {

        const nodePoolName = getNodePoolName();

        const root = scope.logicRootNode.fetchByNaming('infra');
        const nodes = root.fetchByNaming('nodes');

        const pool = nodes.fetchByNaming('pool', nodePoolName);

        const node = pool.fetchByNaming('node', metadata.name!);
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
    'eks.amazonaws.com/nodegroup'
]