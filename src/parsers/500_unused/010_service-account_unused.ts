import _ from 'the-lodash';
import { K8sServiceAccountParser } from '../../parser-builder/k8s';

export default K8sServiceAccountParser()
    .handler(({ item, metadata }) => {

        if (metadata.name !== 'default') {
            if (item.resolveSourceLinks('k8s-owner').length == 0)
            {
                item.addAlert('Unused', 'warn', 'ServiceAccount not used.');
            }
        }

    })
    ;
