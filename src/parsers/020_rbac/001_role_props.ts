import _ from 'the-lodash';
import { LogicRoleRuntime } from '../../types/parser/logic-rbac';
import { K8sRoleParser } from '../../parser-builder/k8s';

export default K8sRoleParser()
    .handler(({ logger, scope, config, item, metadata, namespace, helpers }) => {

        const rulesMap = helpers.roles.makeRulesMap();
        (<LogicRoleRuntime>item.runtime).rules = rulesMap;

        for(const rule of (config.rules || []))
        {
            for(const api of (rule.apiGroups || []))
            {
                for(const resource of (rule.resources || []))
                {
                    if (rule.resourceNames) {
                        for(const resourceName of rule.resourceNames) {
                            helpers.roles.addRule(rulesMap, api, resource, resourceName, rule.verbs)
                        }
                    } else {
                        helpers.roles.addRule(rulesMap, api, resource, '*', rule.verbs)
                    }
                }
            }
        }

        item.addProperties(helpers.roles.buildRoleMatrixProps(rulesMap));

    })
    ;
