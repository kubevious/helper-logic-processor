import _ from 'the-lodash';
import { ScopeParser } from '../parser-builder';

export default ScopeParser()
    .order(111)
    .target({
        scopeKind: 'PersistentVolume'
    })
    .kind('pv')
    .handler(({ scope, itemScope, createK8sItem, createAlert, helpers }) => {

        let claimRef = _.get(itemScope.config, 'spec.claimRef');
        if (claimRef)
        {
            let namespaceScope = scope.getNamespaceScope(claimRef.namespace);
            let pvcScope = namespaceScope.items.get('PersistentVolumeClaim', claimRef.name)
            if (pvcScope)
            {
                for(let pvcItem of pvcScope.items)
                {
                    let pv = pvcItem.fetchByNaming("pv", itemScope.name);
                    scope.setK8sConfig(pv, itemScope.config);
                    itemScope.registerItem(pv);
                    itemScope.markUsedBy(pv);
                }
            }
        }


        {
            let storageClassName = _.get(itemScope.config, 'spec.storageClassName');
            if (!storageClassName) {
                storageClassName = 'default';
            }
            let infra = scope.fetchInfraRawContainer();
            let storage = infra.fetchByNaming("storage", "Storage");
            let storageClass = storage.fetchByNaming("storclass", storageClassName);
            let pvItem = createK8sItem(storageClass);
            itemScope.registerItem(pvItem);
        }

        if (itemScope.isNotUsed)
        {
            createAlert('Unused', 'warn', 'PersistentVolume not attached.');
        }

        itemScope.buildProperties()
            .fromConfig('StorageClass', 'spec.storageClassName')
            .fromConfig('Status', 'status.phase')
            .fromConfig('Finalizers', 'metadata.finalizers')
            .fromConfig('Capacity', 'spec.capacity.storage', undefined, x => helpers.resources.parseMemory(x))
            .fromConfig('Access Modes', 'spec.accessModes')
            .fromConfig('Volume Mode', 'spec.volumeMode')
            .fromConfig('Reclaim Policy', 'spec.persistentVolumeReclaimPolicy')
            .build()

    })
    ;