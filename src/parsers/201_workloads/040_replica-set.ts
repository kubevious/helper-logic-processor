import { ReplicaSet } from 'kubernetes-types/apps/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';

export default K8sParser<ReplicaSet>()
    .target({
        api: "apps",
        kind: "ReplicaSet"
    })
    .handler(({ logger, config, item, metadata, helpers }) => {

        helpers.logic.processOwnerReferences(item, NodeKind.replicaset, metadata);

        if (item.resolveTargetLinks('logic').length == 0)
        {
            item.raiseAlert(ValidatorID.UNOWNED_REPLICA_SET, 'Directly using ReplicaSet. Use Deployment, StatefulSet or DaemonSet instead.');
        }

    })
    ;
