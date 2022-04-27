import _ from 'the-lodash';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';
import { K8sPodParser } from '../../parser-builder/k8s';
import { LogicPodRuntime } from '../../types/parser/logic-pod';

export default K8sPodParser()
    .handler(({ logger, config, item, metadata, helpers, scope, runtime }) => {

        helpers.logic.processOwnerReferences(item, NodeKind.pod, metadata,
            {
                addToAppOwnersDict: true
            });

        const logicPods = item.resolveTargetLinkItems(LogicLinkKind.logic);
        for(const logicPodItem of logicPods) {
            const logicPodRuntime = logicPodItem.runtime as LogicPodRuntime;
            logicPodRuntime.phase = runtime.phase;
            logicPodRuntime.runStage = runtime.runStage;
            logicPodRuntime.conditions = runtime.conditions;
            logicPodRuntime.radioactiveProps = runtime.radioactiveProps;
        }

        if (logicPods.length == 0)
        {
            item.raiseAlert(ValidatorID.UNOWNED_POD, 'Controller not found.');
        }
    })
    ;
