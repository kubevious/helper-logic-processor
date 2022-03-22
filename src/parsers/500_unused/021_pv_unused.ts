import _ from 'the-lodash';
import { K8sPersistentVolumeParser } from '../../parser-builder/k8s';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default K8sPersistentVolumeParser()
    .handler(({ item }) => {

        if (item.resolveSourceLinks(LogicLinkKind.volume).length == 0)
        {
            item.raiseAlert(ValidatorID.UNUSED_PV, 'PersistentVolume not attached.');
        }

    })
    ;
