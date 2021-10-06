import _ from 'the-lodash';
import { LogicRoleRuntime } from '../../types/parser/logic-rbac';
import { K8sRoleParser } from '../../parser-builder/k8s';

export default K8sRoleParser()
    .handler(({ logger, scope, config, item, metadata, namespace, helpers }) => {

        const pspRules = (<LogicRoleRuntime>item.runtime).rules['policy/podsecuritypolicies'];

        if (!pspRules) {
            return;
        }

        for(let itemInfo of pspRules.items)
        {
            if (itemInfo.verbs['use'])
            {
                const subjectDn = helpers.k8s.makeDn(null, 'policy/v1beta1', 'PodSecurityPolicy', itemInfo.name);
                const pspItem = item.link('psp', subjectDn, itemInfo.name);
                if (!pspItem)
                {
                    item.addAlert('MissingPsp', 'error', `PodSecurityPolicy "${itemInfo.name}" not found.`);
                }
            }
        }

    })
    ;
