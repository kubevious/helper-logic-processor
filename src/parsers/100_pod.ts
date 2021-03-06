import _ from 'the-lodash';
import { ConcreteParser } from '../parser-builder';
import { makeRelativeName } from "../utils/name-helpers.js";

export default ConcreteParser()
    .order(100)
    .target({
        api: "v1",
        kind: "Pod"
    })
    .kind('pod')
    .needNamespaceScope(true)
    .handler(({ scope, item, createK8sItem, createAlert, hasCreatedItems, namespaceScope }) => {

        var itemScope = namespaceScope.items.register(item.config);
        
        var conditions = _.get(item.config, 'status.conditions');
        if (conditions) {
            for(var condition of conditions) {
                if (condition.status != 'True') {
                    var msg = 'There was error with ' + condition.type + '. ';
                    if (condition.message) {
                        msg += condition.message;
                    }
                    createAlert(condition.type, 'error', msg);
                }
            }
        }

        if (item.config.metadata.ownerReferences)
        {
            for(var ref of item.config.metadata.ownerReferences)
            {
                var ownerItems = namespaceScope.getAppOwners(ref.kind, ref.name);
                for(var ownerItem of ownerItems) 
                {
                    var shortName = makeRelativeName(ownerItem.config.metadata.name, item.config.metadata.name);
                    var logicItem = createK8sItem(ownerItem, { name: shortName });
                    itemScope.registerItem(logicItem);
                }
            }
        }

        if (!hasCreatedItems()) {
            var rawContainer = scope.fetchRawContainer(item, "Pods");
            logicItem = createK8sItem(rawContainer);
            itemScope.registerItem(logicItem);

            createAlert('MissingController', 'warn', 'Controller not found.');
        }

    })
    ;