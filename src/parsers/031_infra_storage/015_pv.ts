import _ from 'the-lodash';
import { K8sPersistentVolumeParser } from '../../parser-builder/k8s';
import { InfraPersistentVolumeRuntime } from '../../types/parser/infra-pv';
import { NodeKind } from '@kubevious/entity-meta';

export default K8sPersistentVolumeParser()
    .handler(({ logger, scope, config, item, runtime, metadata, helpers }) => {

        if (!config.spec) {
            return;
        }

        runtime.capacity = helpers.resources.parseMemory(config.spec?.capacity?.storage);

        const root = scope.logicRootNode.fetchByNaming(NodeKind.infra);
        const storage = root.fetchByNaming(NodeKind.storage);

        const storageClassName = config.spec.storageClassName || "default";
        const storageClass = storage.fetchByNaming(NodeKind.storclass, storageClassName);

        const infraPv = helpers.shadow.create(item, storageClass,
            {
                kind: NodeKind.pv,
                linkName: 'k8s-owner'
            });

        (<InfraPersistentVolumeRuntime>infraPv.runtime).capacity = runtime.capacity;

    })
    
    ;
