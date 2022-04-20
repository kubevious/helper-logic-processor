import _ from 'the-lodash';
import { K8sRoleBindingParser } from '../../parser-builder/k8s';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default K8sRoleBindingParser()
    .handler(({ item, config, metadata, helpers }) => {

        if (helpers.roles.isDefaultRbacObject(metadata))
        {
            return;
        }

        if (item.resolveTargetLinks(LogicLinkKind.subject).length == 0)
        {
            item.raiseAlert(ValidatorID.UNUSED_ROLE_BINDING, `${config.kind} not used.`);
        }

    })
    ;
