import _ from 'the-lodash';
import { ScopeParser } from '../parser-builder';

export default ScopeParser()
    .order(135)
    .target({
        namespaced: true, // TODO: Fix later. ClusterRole scope should be created as NonNamespaced in step# 115.
        scopeKind: 'ClusterRole'
    })
    .target({
        namespaced: true,
        scopeKind: 'Role'
    })
    .handler(({ scope, infraScope, itemScope }) => {

        var key = 'policy/podsecuritypolicies';
        var pspRules = itemScope.data.rules[key]; // TODO: Fix Me. Sometimes rules is not set. 
        if (!pspRules) {
            return;
        }

        for(var pspRuleItem of pspRules.items)
        {
            if (pspRuleItem.verbs['use'])
            {
                var pspScope = infraScope.items.get('PodSecurityPolicy', pspRuleItem.name);
                if (pspScope)
                {
                    for(var roleItem of itemScope.items)
                    {
                        var psp = roleItem.fetchByNaming("psp", pspScope.name);
                        scope.setK8sConfig(psp, pspScope.config);
                        pspScope.registerItem(psp);
                        pspScope.markUsedBy(psp);
                    }
                }
                else
                {
                   itemScope.createAlert('missing-psp', 'error', 'PodSecurityPolicy "' + pspRuleItem.name + '" not found.')
                }
            }
        }

    })
    ;