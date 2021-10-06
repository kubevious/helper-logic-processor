import _ from 'the-lodash';
import { K8sStorageClassParser } from '../../parser-builder/k8s';

export default K8sStorageClassParser()
    .handler(({ logger, scope, config, item, metadata, helpers }) => {

        const root = scope.logicRootNode.fetchByNaming('infra');
        const storage = root.fetchByNaming('storage');

        const storageClass = storage.fetchByNaming('storclass', metadata.name!);
        storageClass.makeShadowOf(item);

    })
    ;
