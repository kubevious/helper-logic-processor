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
        for(const ref of ownerReferences)
        {
            const ownerDn = helpers.k8s.makeDn(namespace!, ref.apiVersion, ref.kind, ref.name);
            const owner = item.link('k8s', ownerDn);
            if (owner)
            {                    
                const shortName = makeRelativeName(owner.naming, metadata.name!);

                const logicOwner = owner.resolveTargetLinkItem('logic');
                if (logicOwner)                 
                { 
                    const logicPod = helpers.shadow.create(item, logicOwner,
                        {
                            kind: NodeKind.pod,
                            name: shortName,
                            linkName: 'k8s',
                            inverseLinkName: 'logic',
                        });

                    (<LogicPodRuntime>logicPod.runtime).namespace = namespace!; 
                 
                    // TODO: IMPLEMENT
                    // (<LogicPodRuntime>logicPod.runtime).app = namespace!; 
                }
            }
        }

        if (item.resolveTargetLinks('logic').length == 0)
        {
            item.addAlert('MissingController', 'warn', 'Controller not found.');
        }

    })
    ;
