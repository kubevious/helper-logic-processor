import { ClusterRole, Role } from 'kubernetes-types/rbac/v1';
import _ from 'the-lodash';
import { LogicLinkKind } from '../../logic/link-kind';
import { RbacGroupOrUserBindingParser } from '../../parser-builder/rbac';

export default RbacGroupOrUserBindingParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {
        
        const userOrGroup = item.parent!;

        const userOrGroupLinkNaming = `${userOrGroup.kind.toString()}::${userOrGroup.naming}`;

        const k8sBinding = item.resolveTargetLinkItem(LogicLinkKind.k8s)!;
        for(const k8sRole of k8sBinding.resolveTargetLinkItems(LogicLinkKind.role))
        {
            const config = <ClusterRole | Role>k8sRole.config;

            helpers.shadow.create(k8sRole, item, 
                {
                    kind: helpers.roles.getTargetRoleKind(config),
                    linkName: LogicLinkKind.k8s,
                    inverseLinkName: LogicLinkKind.rbac,
                    inverseLinkPath: `${userOrGroupLinkNaming}::${item.kind.toString()}::${item.naming}`
                })
                
            k8sRole.link(LogicLinkKind.rbac, userOrGroup, userOrGroupLinkNaming);
        }
    })
    ;
