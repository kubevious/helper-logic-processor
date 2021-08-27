import { ReplicaSet } from 'kubernetes-types/apps/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';

import { makeRelativeName } from '../../utils/name-helpers';

export default K8sParser<ReplicaSet>()
    .only()
    .target({
        kind: "Pod"
    })
    .handler(({ logger, config, item, namespace, helpers }) => {

        if (config.metadata!.ownerReferences)
        {
            for(let ref of config.metadata!.ownerReferences)
            {
                logger.info("POD REF: ", ref);

                const ownerDn = helpers.k8s.makeDn(namespace!, ref.apiVersion, ref.kind, ref.name);

                logger.info("POD OWNER: %s", ownerDn);

                item.link('k8s-owner', ownerDn);

                const owner = item.resolveLink('k8s-owner');
                if (owner)
                {                    
                    let shortName = makeRelativeName(owner.naming, item.config.metadata.name);

                    const logicOwner = owner.resolveLink('logic');
                    if (logicOwner)                 
                    { 
                        const logicItem = logicOwner.fetchByNaming('pod', shortName);
                        item.link('logic', logicItem);
                    }
                }

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
