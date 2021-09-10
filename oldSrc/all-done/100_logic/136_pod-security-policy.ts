import _ from 'the-lodash';
import { ScopeParser } from '../../parser-builder';

export default ScopeParser()
    .target({
        namespaced: false,
        scopeKind: 'PodSecurityPolicy'
    })
    .kind('psp')
    .handler(({ scope, itemScope, createK8sItem, createAlert, helpers }) => {

        if (itemScope.isNotUsed)
        {
            let rawContainer = scope.fetchNamespaceRawContainer("", "PodSecurityPolicies");
            let logicItem = createK8sItem(rawContainer);
            itemScope.registerItem(logicItem);
            createAlert('Unused', 'warn', itemScope.kind + ' not used.');
        }

        itemScope.buildProperties()
            .fromConfig('Priviledged', 'spec.allowPrivilegeEscalation', false)
            .fromConfig('Capabilities', 'spec.allowedCapabilities')
            .fromConfig('seLinux', 'spec.seLinux.rule')
            .fromConfig('RunAsUser', 'spec.runAsUser.rule')
            .fromConfig('FSGroup', 'spec.fsGroup.rule')
            .fromConfig('Groups', 'spec.supplementalGroups.rule')
            .fromConfig('ReadOnlyRootFS', 'spec.readOnlyRootFilesystem', false)
            .fromConfig('Volumes', 'spec.volumes', [])
            .build()

            helpers.common.determineSharedFlag(itemScope);

    })
    ;