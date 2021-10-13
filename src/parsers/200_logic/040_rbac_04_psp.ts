import _ from 'the-lodash';
import { LogicRoleParser } from '../../parser-builder/logic';
import { PodSecurityPolicy } from 'kubernetes-types/policy/v1beta1';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicRoleParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        let k8sRole = item.resolveTargetLinkItem('k8s-owner')!;

        for(let k8sPsp of k8sRole.resolveTargetLinkItems('psp'))
        {
            const config = <PodSecurityPolicy>k8sPsp.config;

            const logicPsp = item.fetchByNaming(NodeKind.psp, config.metadata!.name!);
            logicPsp.makeShadowOf(k8sPsp);
            logicPsp.link('k8s-owner', k8sPsp);
        }

    })
    ;
