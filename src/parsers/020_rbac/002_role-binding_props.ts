import _ from 'the-lodash';
import { LogicRoleRuntime } from '../../types/parser/logic-rbac';
import { K8sRoleBindingParser } from '../../parser-builder/k8s';
import { RoleRef, Subject } from 'kubernetes-types/rbac/v1';

export default K8sRoleBindingParser()
    .handler(({ logger, scope, config, item, metadata, namespace, runtime, helpers }) => {

        if (config.roleRef)
        {
            processRole(config.roleRef);
        }

        if (!runtime.rules) {
            runtime.rules = helpers.roles.makeRulesMap();
        }

        item.addProperties(helpers.roles.buildRoleMatrixProps(runtime.rules));

        for(let subjectRef of (config.subjects || []))
        {
            processSubject(subjectRef);
        }
        
        /*** HELPERS ***/
        function processRole(roleRef: RoleRef)
        {
            const targetNamespace = namespace || null;

            const roleDn = helpers.k8s.makeDn(targetNamespace, config.apiVersion!, roleRef.kind, roleRef.name);
            const role = item.link('role', roleDn);
            if (role)
            {
                runtime.rules = (<LogicRoleRuntime>role.runtime).rules;
            }
            else
            {
                if (targetNamespace) {
                    item.addAlert('Missing', 'error', `Could not find ${roleRef.kind} ${targetNamespace} :: ${roleRef.name}.`);
                } else {
                    item.addAlert('Missing', 'error', `Could not find ${roleRef.kind} ${roleRef.name}.`);
                }
            }
        }

        function processSubject(subjectRef: Subject)
        {
            if (subjectRef.kind == 'ServiceAccount')
            {
                const targetNamespace = subjectRef.namespace || namespace || null;
                const subjectDn = helpers.k8s.makeDn(targetNamespace, 'v1', subjectRef.kind, subjectRef.name);

                const linkNamingParts = [subjectRef.kind];
                if (targetNamespace) {
                    linkNamingParts.push(targetNamespace);
                }
                linkNamingParts.push(subjectRef.name);
                const linkNaming = linkNamingParts.join('_');

                const svcAccount = item.link('subject', subjectDn, linkNaming);
                if (!svcAccount) { 
                    if (targetNamespace) {
                        item.addAlert('Missing', 'error', `Could not find ${subjectRef.kind} ${targetNamespace} :: ${subjectRef.name}.`);
                    } else {
                        item.addAlert('Missing', 'error', `Could not find ${subjectRef.kind} ${subjectRef.name}.`);
                    }
                }
            }
        }

    })
    ;
