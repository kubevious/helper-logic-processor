import _ from 'the-lodash';
import { ConcreteParser } from '../../parser-builder';

export default ConcreteParser()
    .target({
        api: "v1",
        kind: "ConfigMap"
    })
    .kind('configmap')
    .needNamespaceScope(true)
    .handler(({ logger, scope, item, createK8sItem, createAlert, namespaceScope, helpers }) => {

        let configMapScope = namespaceScope.items.getByConcrete(item)!;

        helpers.common.determineSharedFlag(configMapScope);

        if (configMapScope.isNotUsed)
        {
            let rawContainer = scope.fetchRawContainer(item, "ConfigMaps");
            createK8sItem(rawContainer);
            createAlert('Unused', 'warn', 'ConfigMap not used.');
        }

    })
    ;
    