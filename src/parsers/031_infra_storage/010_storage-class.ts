import _ from 'the-lodash';
import { K8sStorageClassParser } from '../../parser-builder/k8s';
import { NodeKind } from '@kubevious/entity-meta';

export default K8sStorageClassParser()
    .handler(({ logger, scope, config, item, metadata, helpers }) => {

        const root = scope.logicRootNode.fetchByNaming(NodeKind.infra);
        const storage = root.fetchByNaming(NodeKind.storage);

        helpers.shadow.create(item, storage,
            {
                kind: NodeKind.storclass,
                linkName: 'k8s-owner'
            })

    })
    ;
