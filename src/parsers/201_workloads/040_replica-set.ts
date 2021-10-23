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
        for(const ref of ownerReferences)
        {
            // TODO : IMPROVE
            const ownerDn = helpers.k8s.makeDn(namespace!, ref.apiVersion, ref.kind, ref.name);
            const owner = item.link('k8s', ownerDn);
            if (owner)
            {                    
                const shortName = makeRelativeName(owner.naming, metadata.name!);

                const logicOwner = owner.resolveTargetLinkItem('logic');
                if (logicOwner)
                { 
                    helpers.shadow.create(item, logicOwner,
                        {
                            kind: NodeKind.replicaset,
                            name: shortName,
                            linkName: 'k8s',
                            inverseLinkName: 'logic',
                        });
            
                }
            }
        }

        if (item.resolveTargetLinks('logic').length == 0)
        {
            item.addAlert('BestPractice', 'warn', 'Directly using ReplicaSet. Use Deployment, StatefulSet or DaemonSet instead.');
        }

    })
    ;
