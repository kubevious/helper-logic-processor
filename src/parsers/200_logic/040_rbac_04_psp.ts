import _ from 'the-lodash';
import { LogicRoleParser } from '../../parser-builder/logic';
import { PodSecurityPolicy } from 'kubernetes-types/policy/v1beta1';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicAppRuntime } from '../../types/parser/logic-app';

export default LogicRoleParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        const app = item.parent!.parent!.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;

        const k8sRole = item.resolveTargetLinkItem('k8s')!;

        for(const k8sPsp of k8sRole.resolveTargetLinkItems('psp'))
        {
            helpers.shadow.create(k8sPsp, item, 
                {
                    kind: NodeKind.psp,
                    linkName: 'k8s',
                    inverseLinkName: 'logic',
                    inverseLinkPath: `${appRuntime.namespace}::${app.naming}`
                })

            k8sPsp.link('app', app, `${appRuntime.namespace}::${app.naming}`);
        }

    })
    ;
