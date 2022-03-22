import _ from 'the-lodash';
import { K8sPersistentVolumeClaimParser } from '../../parser-builder/k8s';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default K8sPersistentVolumeClaimParser()
    .handler(({ item }) => {

        if (item.resolveSourceLinks(LogicLinkKind.k8s).length == 0)
        {
            item.raiseAlert(ValidatorID.UNUSED_PVC, 'PersistentVolumeClaim not attached.');
        }

    })
    ;
