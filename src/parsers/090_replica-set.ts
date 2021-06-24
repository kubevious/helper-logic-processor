import _ from 'the-lodash';
import { ConcreteParser } from '../parser-builder';

import { makeRelativeName } from "../utils/name-helpers.js";
import { LogicItem } from '../item';

export default ConcreteParser()
    .order(90)
    .target({
        api: "apps",
        kind: "ReplicaSet"
    })
    .kind('replicaset')
    .needNamespaceScope(true)
    .handler(({ scope, item, createK8sItem, createAlert, hasCreatedItems, namespaceScope }) => {

        if (item.config.metadata.ownerReferences)
        {
            for(let ref of item.config.metadata.ownerReferences)
            {
                let ownerItems = namespaceScope.getAppOwners(ref.kind, ref.name);
                for(let ownerItem of ownerItems) 
                {
                    let shortName = makeRelativeName(ownerItem.config.metadata.name, item.config.metadata.name);
                    createReplicaSet(ownerItem, { name: shortName });
                }
            }
        }

        if (!hasCreatedItems()) {
            let rawContainer = scope.fetchRawContainer(item, "ReplicaSets");
            createReplicaSet(rawContainer);
            createAlert('BestPractice', 'warn', 'Directly using ReplicaSet. Use Deploment, StatefulSet or DaemonSet instead.');
        }

        /*** HELPERS ***/
        function createReplicaSet(parent: LogicItem, params? : any)
        {
            let k8sReplicaSet = createK8sItem(parent, params);
            namespaceScope.registerAppOwner(k8sReplicaSet);
            return k8sReplicaSet;
        }

    })
    ;