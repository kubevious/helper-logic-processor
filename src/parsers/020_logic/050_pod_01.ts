import { Pod } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';

import { makeRelativeName } from '../../utils/name-helpers';
import { LogicPodRuntime } from '../../types/parser/logic-pod';

export default K8sParser<Pod>()
    .target({
        kind: "Pod"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        if (metadata.ownerReferences)
        {
            for(let ref of metadata.ownerReferences)
            {
                const ownerDn = helpers.k8s.makeDn(namespace!, ref.apiVersion, ref.kind, ref.name);
                item.link('k8s-owner', ownerDn);

                const owner = item.resolveLink('k8s-owner');
                if (owner)
                {                    
                    let shortName = makeRelativeName(owner.naming, metadata.name!);

                    const logicOwner = owner.resolveLink('logic');
                    if (logicOwner)                 
                    { 
                        const logicPod = logicOwner.fetchByNaming('pod', shortName);
                        logicPod.makeShadowOf(item);
                        (<LogicPodRuntime>logicPod.runtime).namespace = namespace!; 
                        item.link('logic', logicPod);
                    }
                }

            }
        }

        // if (!hasCreatedItems()) {
        //     let rawContainer = scope.fetchRawContainer(item, "ReplicaSets");
        //     createReplicaSet(rawContainer);
        //     createAlert('BestPractice', 'warn', 'Directly using ReplicaSet. Use Deployment, StatefulSet or DaemonSet instead.');
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
