import { Pod } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default K8sParser<Pod>()
    .target({
        kind: "Pod"
    })
    .handler(({ logger, config, item, metadata, helpers }) => {
        helpers.logic.processOwnerReferences(item, NodeKind.pod, metadata);

        if (item.resolveTargetLinks(LogicLinkKind.logic).length == 0)
        {
            item.raiseAlert(ValidatorID.UNOWNED_POD, 'Controller not found.');
        }
    })
    ;
