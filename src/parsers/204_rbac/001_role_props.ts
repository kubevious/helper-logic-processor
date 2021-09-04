import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { ClusterRole, Role } from 'kubernetes-types/rbac/v1';
import { LogicRoleRuntime } from '../../types/parser/logic-role';

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

        const rulesMap = helpers.roles.makeRulesMap();
        (<LogicRoleRuntime>item.runtime).rules = rulesMap;

        for(let rule of (config.rules || []))
        {
            for(let api of (rule.apiGroups || []))
            {
                for(let resource of (rule.resources || []))
                {
                    if (rule.resourceNames) {
                        for(let resourceName of rule.resourceNames) {
                            helpers.roles.addRule(rulesMap, api, resource, resourceName, rule.verbs)
                        }
                    } else {
                        helpers.roles.addRule(rulesMap, api, resource, '*', rule.verbs)
                    }
                }
            }
        }

        item.addProperties(helpers.roles.buildRoleMatrixProps(rulesMap));

        /*** HELPERS ***/
        // function fetchNamespaceName()
        // {
        //     if(config.kind == "Role") {
        //         return item.config.metadata.namespace!;
        //     }
        //     if(config.kind == "ClusterRole") {
        //         return '';
        //     }
        //     throw new Error();
        // }

    })
    ;
