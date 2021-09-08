import _ from 'the-lodash';
import { LogicRoleParser } from '../../parser-builder/logic';
import { PodSecurityPolicy } from 'kubernetes-types/policy/v1beta1';

export default LogicRoleParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        let k8sRole = item.resolveTargetLinkItem('k8s-owner')!;

        for(let k8sPsp of k8sRole.resolveTargetLinkItems('psp'))
        {
            const config = <PodSecurityPolicy>k8sPsp.config;

            const logicPsp = item.fetchByNaming('psp', config.metadata!.name!);
            logicPsp.makeShadowOf(k8sRole);
            logicPsp.link('k8s-owner', k8sRole);
        }

    })
    ;
