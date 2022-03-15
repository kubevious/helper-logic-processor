import _ from 'the-lodash';
import { K8sRoleBindingParser } from '../../parser-builder/k8s';
import { ValidatorID } from '@kubevious/entity-meta';

export default K8sRoleBindingParser()
    .handler(({ item, config }) => {

        // TODO: Handle the case of User Subjects.
        if (item.resolveTargetLinks('app').length == 0)
        {
            item.raiseAlert(ValidatorID.UNUSED_ROLE_BINDING, `${config.kind} not used.`);
        }

    })
    ;
