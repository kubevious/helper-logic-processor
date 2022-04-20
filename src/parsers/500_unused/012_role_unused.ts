import _ from 'the-lodash';
import { K8sRoleParser } from '../../parser-builder/k8s';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default K8sRoleParser()
    .handler(({ item, config, metadata, helpers }) => {

        if (helpers.roles.isDefaultRbacObject(metadata))
        {
            return;
        }

        if (item.resolveTargetLinks(LogicLinkKind.binding).length == 0)
        {
            item.raiseAlert(ValidatorID.UNUSED_ROLE, `${config.kind} not used.`);
        }

    })
    ;
