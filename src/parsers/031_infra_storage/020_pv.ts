import _ from 'the-lodash';
import { K8sPersistentVolumeParser } from '../../parser-builder/k8s';

export default K8sPersistentVolumeParser()
    .handler(({ logger, config, item, runtime, metadata, helpers }) => {

        if (!config.spec) {
            return;
        }

        {
            const storageClassName = config.spec.storageClassName;
            if (storageClassName) {
                const storageClassDn = helpers.k8s.makeDn(null, 'storage.k8s.io/v1', 'StorageClass', storageClassName)
                item.link('storage-class', storageClassDn);
            }
        }

        {
            runtime.capacity = helpers.resources.parseMemory(config.spec?.capacity?.storage);
        }
    })
    
    ;
