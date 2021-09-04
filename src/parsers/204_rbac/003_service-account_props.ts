import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { ServiceAccount } from 'kubernetes-types/core/v1';
import { LogicRoleBindingRuntime, LogicServiceAccountRuntime } from '../../types/parser/logic-rbac';

export default K8sParser<ServiceAccount, LogicServiceAccountRuntime>()
    .target({
        kind: "ServiceAccount"
    })
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
