import { Pod } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';
import { LogicCommonWorkload } from '../../types/parser/logic-common';
import { LogicAppRuntime } from '../../types/parser/logic-app';

export default K8sParser<Pod>()
    .target({
        kind: "Pod"
    })
    .handler(({ logger, config, item, metadata, helpers, scope }) => {
        helpers.logic.processOwnerReferences(item, NodeKind.pod, metadata,
            {
                addToAppOwnersDict: true
            });

        if (item.resolveTargetLinks(LogicLinkKind.logic).length == 0)
        {
            item.raiseAlert(ValidatorID.UNOWNED_POD, 'Controller not found.');
        }
    })
    ;
