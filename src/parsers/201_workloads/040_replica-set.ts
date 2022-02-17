import { ReplicaSet } from 'kubernetes-types/apps/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';

import { makeRelativeName } from '../../utils/name-helpers';
import { LogicReplicaSetRuntime } from '../../types/parser/logic-replica-set'
import { LogicCommonWorkload } from '../../types/parser/logic-common';

export default K8sParser<ReplicaSet>()
    .target({
        api: "apps",
        kind: "ReplicaSet"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        const ownerReferences = metadata.ownerReferences ?? [];
        for(const ref of ownerReferences)
        {
            const ownerDn = helpers.k8s.makeDn(namespace!, ref.apiVersion, ref.kind, ref.name);
            const owner = item.link('owner', ownerDn);
            if (owner)
            {                    
                const shortName = makeRelativeName(owner.naming, metadata.name!);

                const logicOwner = owner.resolveTargetLinkItem('logic');
                if (logicOwner)
                { 
                    const logicReplicaSet = helpers.shadow.create(item, logicOwner,
                        {
                            kind: NodeKind.replicaset,
                            name: shortName,
                            linkName: 'k8s',
                            inverseLinkName: 'logic',
                        });

                    const logicOwnerRuntime = <LogicCommonWorkload>logicOwner.runtime;
                    if (logicOwnerRuntime)
                    {
                        (<LogicReplicaSetRuntime>logicReplicaSet.runtime).namespace = logicOwnerRuntime.namespace;
                        (<LogicReplicaSetRuntime>logicReplicaSet.runtime).app = logicOwnerRuntime.app;
                    }
            
                }
            }
        }

        if (item.resolveTargetLinks('logic').length == 0)
        {
            item.raiseAlert(ValidatorID.UNOWNED_POD, 'Directly using ReplicaSet. Use Deployment, StatefulSet or DaemonSet instead.');
        }

    })
    ;
