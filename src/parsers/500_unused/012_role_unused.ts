import _ from 'the-lodash';
import { K8sRoleParser } from '../../parser-builder/k8s';

export default K8sRoleParser()
    .handler(({ item, config }) => {

        if (item.resolveTargetLinks('app').length == 0)
        {
            item.addAlert('Unused', 'warn', `${config.kind} not used.`);
        }

    })
    ;
