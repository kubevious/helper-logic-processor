import _ from 'the-lodash';
import { K8sPersistentVolumeParser } from '../../parser-builder/k8s';
import { InfraPersistentVolumeRuntime } from '../../types/parser/infra-pv';

export default K8sPersistentVolumeParser()
    .handler(({ logger, scope, config, item, runtime, metadata, helpers }) => {

        if (!config.spec) {
            return;
        }

        runtime.capacity = helpers.resources.parseMemory(config.spec?.capacity?.storage);

        const root = scope.logicRootNode.fetchByNaming('infra');
        const storage = root.fetchByNaming('storage');

        const storageClassName = config.spec.storageClassName || "default";
        const storageClass = storage.fetchByNaming('storclass', storageClassName);

        const infraPv = storageClass.fetchByNaming('pv', item.naming!);
        (<InfraPersistentVolumeRuntime>infraPv.runtime).capacity = runtime.capacity;
        infraPv.makeShadowOf(item);

    })
    
    ;
