import { ReplicaSet } from 'kubernetes-types/apps/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';

import { makeRelativeName } from '../../utils/name-helpers';

export default K8sParser<ReplicaSet>()
    .target({
        api: "apps",
        kind: "ReplicaSet"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        const ownerReferences = metadata.ownerReferences ?? [];
        for(let ref of ownerReferences)
        {
            const ownerDn = helpers.k8s.makeDn(namespace!, ref.apiVersion, ref.kind, ref.name);
            const owner = item.link('k8s-owner', ownerDn);
            if (owner)
            {                    
                const shortName = makeRelativeName(owner.naming, metadata.name!);

                const logicOwner = owner.resolveTargetLinkItem('logic');
                if (logicOwner)
                { 
                    const logicItem = logicOwner.fetchByNaming(NodeKind.replicaset, shortName);
                    logicItem.makeShadowOf(item);
                    item.link('logic', logicItem);
                }
            }
        }

        if (item.resolveTargetLinks('logic').length == 0)
        {
            item.addAlert('BestPractice', 'warn', 'Directly using ReplicaSet. Use Deployment, StatefulSet or DaemonSet instead.');
        }

    })
    ;
