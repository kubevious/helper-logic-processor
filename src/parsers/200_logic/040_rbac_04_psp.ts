import _ from 'the-lodash';
import { LogicRoleParser } from '../../parser-builder/logic';
import { PodSecurityPolicy } from 'kubernetes-types/policy/v1beta1';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicRoleParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        const k8sRole = item.resolveTargetLinkItem('k8s-owner')!;

        for(const k8sPsp of k8sRole.resolveTargetLinkItems('psp'))
        {
            helpers.shadow.create(k8sPsp, item, 
                {
                    kind: NodeKind.psp,
                    linkName: 'k8s-owner'
                })
        }

    })
    ;
