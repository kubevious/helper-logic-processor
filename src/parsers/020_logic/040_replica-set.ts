import { ReplicaSet } from 'kubernetes-types/apps/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';

export default K8sParser<ReplicaSet>()
    .only()
    .target({
        api: "apps",
        kind: "ReplicaSet"
    })
    .handler(({ logger, scope, config, item}) => {

        if (config.metadata!.ownerReferences)
        {
            for(let ref of config.metadata!.ownerReferences)
            {
                logger.info("REF: ", ref);
                // let ownerItems = namespaceScope.getAppOwners(ref.kind, ref.name);
                // for(let ownerItem of ownerItems) 
                // {
                //     let shortName = makeRelativeName(ownerItem.config.metadata.name, item.config.metadata.name);
                //     createReplicaSet(ownerItem, { name: shortName });
                // }
            }
        }

        // if (!hasCreatedItems()) {
        //     let rawContainer = scope.fetchRawContainer(item, "ReplicaSets");
        //     createReplicaSet(rawContainer);
        //     createAlert('BestPractice', 'warn', 'Directly using ReplicaSet. Use Deploment, StatefulSet or DaemonSet instead.');
        // }

        // /*** HELPERS ***/
        // function createReplicaSet(parent: LogicItem, params? : any)
        // {
        //     let k8sReplicaSet = createK8sItem(parent, params);
        //     namespaceScope.registerAppOwner(k8sReplicaSet);
        //     return k8sReplicaSet;
        // }

    })
    ;
