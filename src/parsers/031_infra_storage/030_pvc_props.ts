import _ from 'the-lodash';
import { K8sPersistentVolumeClaimParser } from '../../parser-builder/k8s';

export default K8sPersistentVolumeClaimParser()
    .handler(({ logger, config, item, runtime, metadata, helpers }) => {

        item.buildProperties()
            .add('StorageClass', config.spec?.storageClassName)
            .add('Status', config.status?.phase)
            .add('Finalizers', config.metadata?.finalizers)
            .add('Capacity Requested', config.spec?.resources?.requests?.storage)
            .add('Capacity Provided', config.status?.capacity?.storage)
            .add('Access Modes', config.spec?.accessModes)
            .add('Volume Mode', config.spec?.volumeMode)
            .build()

    })
    
    ;
