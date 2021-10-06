import _ from 'the-lodash';
import { ScopeParser } from '../../parser-builder';


export default ScopeParser()
    .target({
        namespaced: true,
        scopeKind: 'ServiceAccount'
    })
    .handler(({ itemScope, helpers }) => {

        itemScope.data.rules = helpers.roles.makeRulesMap();

        let bindingScopes = itemScope.data.bindings;
        if (bindingScopes)
        {
            for(let bindingScope of bindingScopes)
            {
                itemScope.data.rules = helpers.roles.combineRulesMap(
                    itemScope.data.rules,
                    bindingScope.data.rules);
            }
        }
        itemScope.data.rules = helpers.roles.optimizeRulesMap(itemScope.data.rules);

        let propsConfig = helpers.roles.buildRoleMatrix(itemScope.data.rules);
        itemScope.addPropertyGroup(propsConfig);

    })
    ;