import _ from 'the-lodash';
import { K8sServiceAccountParser } from '../../parser-builder/k8s';
import { ValidatorID } from '@kubevious/entity-meta';

export default K8sServiceAccountParser()
    .handler(({ item, metadata }) => {

        if (metadata.name !== 'default') {
            if (item.resolveSourceLinks('k8s').length == 0)
            {
                item.raiseAlert(ValidatorID.UNUSED_SERVICE_ACCOUNT, 'ServiceAccount not used.');
            }
        }

    })
    ;
