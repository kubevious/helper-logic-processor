import _ from 'the-lodash';
import { LogicRoleRuntime } from '../../types/parser/logic-rbac';
import { K8sRoleParser } from '../../parser-builder/k8s';

export default K8sRoleParser()
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

    })
    ;
