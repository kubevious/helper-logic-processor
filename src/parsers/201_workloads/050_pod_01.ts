import { Pod } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';

import { makeRelativeName } from '../../utils/name-helpers';
import { LogicPodRuntime } from '../../types/parser/logic-pod';
import { LogicCommonWorkload } from '../../types/parser/logic-common';

export default K8sParser<Pod>()
    .target({
        kind: "Pod"
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
                    const logicPod = helpers.shadow.create(item, logicOwner,
                        {
                            kind: NodeKind.pod,
                            name: shortName,
                            linkName: 'k8s',
                            inverseLinkName: 'logic',
                        });

                    const logicOwnerRuntime = <LogicCommonWorkload>logicOwner.runtime;
                    if (logicOwnerRuntime)
                    {
                        (<LogicPodRuntime>logicPod.runtime).namespace = logicOwnerRuntime.namespace;
                        (<LogicPodRuntime>logicPod.runtime).app = logicOwnerRuntime.app;
                    }
                }
            }
        }

        if (item.resolveTargetLinks('logic').length == 0)
        {
            item.raiseAlert(ValidatorID.UNOWNED_POD, 'Controller not found.');
        }

    })
    ;
