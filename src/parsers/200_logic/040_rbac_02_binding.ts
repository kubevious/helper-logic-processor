import _ from 'the-lodash';
import { LogicServiceAccountParser } from '../../parser-builder/logic';
import { ClusterRoleBinding, RoleBinding } from 'kubernetes-types/rbac/v1';

export default LogicServiceAccountParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        const app = item.parent!;
        let k8sSvcAccount = item.resolveTargetLinkItem('k8s-owner')!;

        for(let k8sBinding of k8sSvcAccount.resolveSourceLinkItems('subject'))
        {
            const config = <ClusterRoleBinding | RoleBinding>k8sBinding.config;

            const logicKind = getTargetKind(config);
            const logicBinding = item.fetchByNaming(logicKind, config.metadata!.name!);
            logicBinding.makeShadowOf(k8sBinding);
            logicBinding.link('k8s-owner', k8sBinding);

            k8sBinding.link('app', app, app.naming);
        }

        /*** HELPERS **/

        function getTargetKind(config : ClusterRoleBinding | RoleBinding)
        {
            if(config.kind == "RoleBinding") {
                return 'rlbndg'
            }
            if(config.kind == "ClusterRoleBinding") {
                return 'crlbndg'
            }
            throw new Error();
        }


    })
    ;
