import _ from 'the-lodash';
import { LogicRoleBindingRuntime } from '../../types/parser/logic-rbac';
import { K8sServiceAccountParser } from '../../parser-builder/k8s';

export default K8sServiceAccountParser()
    .handler(({ logger, scope, config, item, metadata, namespace, runtime, helpers }) => {

        runtime.rules = helpers.roles.makeRulesMap();

        const bindingItems = item.resolveSourceLinkItems('subject');
        for(let bindingItem of bindingItems)
        {
            runtime.rules = helpers.roles.combineRulesMap(
                runtime.rules,
                (<LogicRoleBindingRuntime>bindingItem.runtime).rules);
        } 

        runtime.rules = helpers.roles.optimizeRulesMap(runtime.rules);

        item.addProperties(helpers.roles.buildRoleMatrixProps(runtime.rules));

    })
    ;
