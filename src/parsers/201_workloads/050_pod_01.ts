import { Pod } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';

import { makeRelativeName } from '../../utils/name-helpers';
import { LogicPodRuntime } from '../../types/parser/logic-pod';

export default K8sParser<Pod>()
    .target({
        kind: "Pod"
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
                    const logicPod = logicOwner.fetchByNaming(NodeKind.pod, shortName);
                    logicPod.makeShadowOf(item);
                    (<LogicPodRuntime>logicPod.runtime).namespace = namespace!; 
                    item.link('logic', logicPod);
                }
            }
        }

        if (item.resolveTargetLinks('logic').length == 0)
        {
            item.addAlert('MissingController', 'warn', 'Controller not found.');
        }

    })
    ;
