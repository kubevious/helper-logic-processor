import _ from 'the-lodash';
import { LogicRoleRuntime } from '../../types/parser/logic-rbac';
import { K8sRoleParser } from '../../parser-builder/k8s';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default K8sRoleParser()
    .handler(({ logger, scope, config, item, metadata, namespace, helpers }) => {

        const pspRules = (<LogicRoleRuntime>item.runtime).rules['policy/podsecuritypolicies'];

        if (!pspRules) {
            return;
        }

        for(const itemInfo of pspRules.items)
        {
            if (itemInfo.verbs['use'])
            {
                const subjectDn = helpers.k8s.makeDn(null, 'policy/v1beta1', 'PodSecurityPolicy', itemInfo.name);
                const pspItem = item.link(LogicLinkKind.psp, subjectDn, itemInfo.name);
                if (!pspItem)
                {
                    item.raiseAlert(ValidatorID.MISSING_PSP, `PodSecurityPolicy "${itemInfo.name}" not found.`);
                }
            }
        }

    })
    ;
