import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { ServiceAccount } from 'kubernetes-types/core/v1';
import { LogicRoleBindingRuntime, LogicServiceAccountRuntime } from '../../types/parser/logic-rbac';

export default K8sParser<ServiceAccount, LogicServiceAccountRuntime>()
    .target({
        kind: "ServiceAccount"
    })
    .handler(({ logger, scope, config, item, metadata, namespace, runtime, helpers }) => {


        // if (config.roleRef)
        // {
        //     const roleDn = helpers.k8s.makeDn(namespace || null, config.apiVersion!, config.roleRef.kind, config.roleRef.name);
        //     const role = item.link('role', roleDn);
        //     if (role)
        //     {
        //         runtime.rules = (<LogicRoleRuntime>role.runtime).rules;
        //     }
        // }

        // if (!runtime.rules) {
        //     runtime.rules = helpers.roles.makeRulesMap();
        // }

        // item.addProperties(helpers.roles.buildRoleMatrixProps(runtime.rules));

        // for(let subjectRef of (config.subjects || []))
        // {
        //     processSubject(subjectRef);
        // }
        
        // /*** HELPERS ***/
        // function processSubject(subjectRef: Subject)
        // {
        //     if (subjectRef.kind == 'ServiceAccount')
        //     {
        //         const targetNamespace = subjectRef.namespace || namespace || null;
        //         const subjectDn = helpers.k8s.makeDn(targetNamespace, 'v1', subjectRef.kind, subjectRef.name);

        //         const linkNamingParts = [subjectRef.kind];
        //         if (targetNamespace) {
        //             linkNamingParts.push(targetNamespace);
        //         }
        //         linkNamingParts.push(subjectRef.name);
        //         const linkNaming = linkNamingParts.join('_');

        //         item.link('subject', subjectDn, linkNaming);
        //     }
        // }

    })
    ;
