import _ from 'the-lodash';
import { K8sPersistentVolumeClaimParser } from '../../parser-builder/k8s';

export default K8sPersistentVolumeClaimParser()
    .handler(({ item }) => {

        if (item.resolveSourceLinks('k8s-owner').length == 0)
        {
            item.addAlert('Unused', 'warn', 'PersistentVolumeClaim not attached.');
        }

    })
    ;
