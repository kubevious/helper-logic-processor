import _ from 'the-lodash';
import { ConcreteParser } from '../../parser-builder';
import { makeRelativeName } from '../../utils/name-helpers';

export default ConcreteParser()
    .target({
        apiName: null,
        kind: "Pod"
    })
    .kind('pod')
    .needNamespaceScope(true)
    .handler(({ scope, item, createK8sItem, createAlert, hasCreatedItems, namespaceScope }) => {

        let itemScope = namespaceScope.items.register(item.config);
        
        let conditions = _.get(item.config, 'status.conditions');
        if (conditions) {
            for(let condition of conditions) {
                if (condition.status != 'True') {
                    let msg = 'There was error with ' + condition.type + '. ';
                    if (condition.message) {
                        msg += condition.message;
                    }
                    createAlert(condition.type, 'error', msg);
                }
            }
        }

        if (item.config.metadata.ownerReferences)
        {
            for(let ref of item.config.metadata.ownerReferences)
            {
                let ownerItems = namespaceScope.getAppOwners(ref.kind, ref.name);
                for(let ownerItem of ownerItems) 
                {
                    let shortName = makeRelativeName(ownerItem.config.metadata.name, item.config.metadata.name);
                    let logicItem = createK8sItem(ownerItem, { name: shortName });
                    itemScope.registerItem(logicItem);
                }
            }
        }

        if (!hasCreatedItems()) {
            let rawContainer = scope.fetchRawContainer(item, "Pods");
            let logicItem = createK8sItem(rawContainer);
            itemScope.registerItem(logicItem);

            createAlert('MissingController', 'warn', 'Controller not found.');
        }

    })
    ;