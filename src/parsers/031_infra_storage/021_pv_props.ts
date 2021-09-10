import _ from 'the-lodash';
import { K8sPersistentVolumeParser } from '../../parser-builder/k8s';

export default K8sPersistentVolumeParser()
    .handler(({ logger, config, item, runtime, metadata, helpers }) => {

        item.buildProperties()
            .add('StorageClass', config.spec?.storageClassName)
            .add('Status', config.status?.phase)
            .add('Finalizers', metadata.finalizers)
            .add('Capacity', runtime.capacity)
            .add('Access Modes', config.spec?.accessModes)
            .add('Volume Mode', config.spec?.volumeMode)
            .add('Reclaim Policy', config.spec?.persistentVolumeReclaimPolicy)
            .build()

    })
    
    ;
