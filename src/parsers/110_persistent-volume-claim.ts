import _ from 'the-lodash';
import { ConcreteParser } from '../parser-builder';

export default ConcreteParser()
    .order(110)
    .target({
        api: "v1",
        kind: "PersistentVolumeClaim"
    })
    .kind('pvc')
    .needNamespaceScope(true)
    .handler(({ scope, item, createK8sItem, createAlert, namespaceScope, helpers }) => {

        var pvcScope = namespaceScope.items.getByConcrete(item)!;

        helpers.common.determineSharedFlag(pvcScope);

        if (pvcScope.isNotUsed)
        {
            var rawContainer = scope.fetchRawContainer(item, "PersistentVolumeClaims");
            var pvcItem = createK8sItem(rawContainer);
            createAlert('Unused', 'warn', 'PersistentVolumeClaim not attached.');
            pvcScope.registerItem(pvcItem);
        }

        pvcScope.buildProperties()
            .fromConfig('StorageClass', 'spec.storageClassName')
            .fromConfig('Status', 'status.phase')
            .fromConfig('Finalizers', 'metadata.finalizers')
            .fromConfig('Capacity Requested', 'spec.resources.requests.storage')
            .fromConfig('Capacity Provided', 'status.capacity.storage')
            .fromConfig('Access Modes', 'spec.accessModes')
            .fromConfig('Volume Mode', 'spec.volumeMode')
            .build()

    })
    ;