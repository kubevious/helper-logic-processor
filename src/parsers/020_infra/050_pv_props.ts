import _ from 'the-lodash';
import { PersistentVolume } from 'kubernetes-types/core/v1';
import { K8sParser } from '../../parser-builder';

export default K8sParser<PersistentVolume>()
    // .trace()
    .target({
        clustered: true,
        kind: "PersistentVolume"
    })
    .handler(({ logger, config, item, runtime, metadata, helpers }) => {

        item.buildProperties()
            .add('StorageClass', config.spec?.storageClassName)
            .add('Status', config.status?.phase)
            .add('Finalizers', metadata.finalizers)
            .add('Capacity', config.spec?.capacity?.storage, undefined, helpers.resources.parseMemory)
            .add('Access Modes', config.spec?.accessModes)
            .add('Volume Mode', config.spec?.volumeMode)
            .add('Reclaim Policy', config.spec?.persistentVolumeReclaimPolicy)
            .build()

    })
    ;
