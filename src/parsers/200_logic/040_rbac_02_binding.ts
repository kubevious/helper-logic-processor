import _ from 'the-lodash';
import { LogicServiceAccountParser } from '../../parser-builder/logic';
import { ClusterRoleBinding, RoleBinding } from 'kubernetes-types/rbac/v1';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicLinkKind } from '../../logic/link-kind';

export default LogicServiceAccountParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        const app = item.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;
        
        const k8sSvcAccount = item.resolveTargetLinkItem(LogicLinkKind.k8s)!;

        for(const k8sBinding of k8sSvcAccount.resolveSourceLinkItems(LogicLinkKind.subject))
        {
            const config = <ClusterRoleBinding | RoleBinding>k8sBinding.config;

            helpers.shadow.create(k8sBinding, item, 
                {
                    kind: getTargetKind(config),
                    linkName: LogicLinkKind.k8s,
                    inverseLinkName: LogicLinkKind.logic,
                    inverseLinkPath: `${appRuntime.namespace}::${app.naming}`
                })
                
            k8sBinding.link(LogicLinkKind.app, app, `${appRuntime.namespace}::${app.naming}`);
        }

        /*** HELPERS **/

        function getTargetKind(config : ClusterRoleBinding | RoleBinding) : NodeKind
        {
            if(config.kind === "RoleBinding") {
                return NodeKind.rlbndg
            }
            if(config.kind === "ClusterRoleBinding") {
                return NodeKind.crlbndg
            }
            throw new Error();
        }


    })
    ;
