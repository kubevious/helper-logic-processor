import _ from 'the-lodash';
import { K8sPersistentVolumeClaimParser } from '../../parser-builder/k8s';

export default K8sPersistentVolumeClaimParser()
    .handler(({ logger, scope, config, item, runtime, metadata, helpers }) => {

        const volumeName = config.spec?.volumeName;
        if (!volumeName) {
            return;
        }

        const k8sPvDn = helpers.k8s.makeDn(null, 'v1', 'PersistentVolume', volumeName);
        const k8sPvc = item.link('volume', k8sPvDn);
        if (k8sPvc) {
            k8sPvc.link('pvc', item);
        } else {
            item.addAlert('MissingPv', 'error', `Missing PersistentVolume ${volumeName}`);
        }

    })
    
    ;
