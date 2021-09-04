import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { ClusterRole, Role } from 'kubernetes-types/rbac/v1';
import { LogicRoleRuntime } from '../../types/parser/logic-rbac';

export default K8sParser<ClusterRole | Role>()
    .target({
        clustered: true,
        api: "rbac.authorization.k8s.io",
        kind: "ClusterRole"
    })
    .target({
        api: "rbac.authorization.k8s.io",
        kind: "Role"
    })
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
                item.link('psp', subjectDn, itemInfo.name);
            }
        }

    })
    ;
