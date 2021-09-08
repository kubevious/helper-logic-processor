import _ from 'the-lodash';
import { LogicBindingParser } from '../../parser-builder/logic';
import { ClusterRole, Role } from 'kubernetes-types/rbac/v1';

export default LogicBindingParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        let k8sBinding = item.resolveTargetLinkItem('k8s-owner')!;

        for(let k8sRole of k8sBinding.resolveTargetLinkItems('role'))
        {
            const config = <ClusterRole | Role>k8sRole.config;

            const logicKind = getTargetKind(config);
            const logicRole = item.fetchByNaming(logicKind, config.metadata!.name!);
            logicRole.makeShadowOf(k8sRole);
            logicRole.link('k8s-owner', k8sRole);
        }

        // /*** HELPERS **/

        function getTargetKind(config : ClusterRole | Role)
        {
            if(config.kind == "Role") {
                return 'rl'
            }
            if(config.kind == "ClusterRole") {
                return 'crl'
            }
            throw new Error();
        }


    })
    ;
