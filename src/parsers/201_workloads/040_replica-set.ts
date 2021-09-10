import { ReplicaSet } from 'kubernetes-types/apps/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';

import { makeRelativeName } from '../../utils/name-helpers';

export default K8sParser<ReplicaSet>()
    .target({
        api: "apps",
        kind: "ReplicaSet"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        if (metadata.ownerReferences)
        {
            for(let ref of metadata.ownerReferences)
            {
                const ownerDn = helpers.k8s.makeDn(namespace!, ref.apiVersion, ref.kind, ref.name);
                const owner = item.link('k8s-owner', ownerDn);
                if (owner)
                {                    
                    let shortName = makeRelativeName(owner.naming, metadata.name!);

                    const logicOwner = owner.resolveTargetLinkItem('logic');
                    if (logicOwner)
                    { 
                        const logicItem = logicOwner.fetchByNaming('replicaset', shortName);
                        logicItem.makeShadowOf(item);
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

    })
    ;
