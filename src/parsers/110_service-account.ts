import _ from 'the-lodash';
import { ConcreteParser } from '../parser-builder';

export default ConcreteParser()
    .order(110)
    .target({
        // api: "v1",
        kind: "ServiceAccount"
    })
    .kind('svcaccnt')
    .needNamespaceScope(true)
    .handler(({ scope, item, namespaceScope, createK8sItem, createAlert, helpers }) => {

        let serviceAccountScope = namespaceScope.items.getByConcrete(item)!;

        if (serviceAccountScope.hasNoOwner)
        {
            let rawContainer = scope.fetchRawContainer(item, "ServiceAccounts");
            let logicItem = createK8sItem(rawContainer);
            // logicItem.associateScope(serviceAccountScope);

            if (logicItem.naming != 'default')
            {
                createAlert('Unused', 'warn', 'ServiceAccount not used.');
            }
        } 
        else 
        {
            for(let owner of serviceAccountScope.owners)
            {
                let logicItem = createK8sItem(owner);
                // logicItem.associateScope(serviceAccountScope);
                serviceAccountScope.registerItem(logicItem);
                serviceAccountScope.markUsedBy(logicItem);
            }

            helpers.common.determineSharedFlag(serviceAccountScope);
        }

    })
    ;