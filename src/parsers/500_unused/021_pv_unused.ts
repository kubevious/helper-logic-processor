import _ from 'the-lodash';
import { K8sPersistentVolumeParser } from '../../parser-builder/k8s';

export default K8sPersistentVolumeParser()
    .handler(({ item }) => {

        if (item.resolveSourceLinks('volume').length == 0)
        {
            item.addAlert('Unused', 'warn', 'PersistentVolume not attached.');
        }

    })
    ;
