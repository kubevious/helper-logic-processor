import _ from 'the-lodash';
import { LogicBindingParser } from '../../parser-builder/logic';
import { ClusterRole, Role } from 'kubernetes-types/rbac/v1';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicLinkKind } from '../../logic/link-kind';

export default LogicBindingParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        const app = item.parent!.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;

        const k8sBinding = item.resolveTargetLinkItem(LogicLinkKind.k8s)!;

        for(const k8sRole of k8sBinding.resolveTargetLinkItems(LogicLinkKind.role))
        {
            const config = <ClusterRole | Role>k8sRole.config;

            helpers.shadow.create(k8sRole, item, 
                {
                    kind: helpers.roles.getTargetRoleKind(config),
                    linkName: LogicLinkKind.k8s,
                    inverseLinkName: LogicLinkKind.logic,
                    inverseLinkPath: `${appRuntime.namespace}::${app.naming}`
                })
                
            k8sRole.link(LogicLinkKind.app, app, `${appRuntime.namespace}::${app.naming}`);
        }

    })
    ;
