import _ from 'the-lodash';
import { LogicRoleRuntime } from '../../types/parser/logic-rbac';
import { K8sRoleBindingParser } from '../../parser-builder/k8s';
import { RoleRef, Subject } from 'kubernetes-types/rbac/v1';
import { NodeKind, ValidatorID } from '@kubevious/entity-meta';
import { LogicItem } from '../../logic/item';
import { LogicLinkKind } from '../../logic/link-kind';

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

        for(const subjectRef of (config.subjects || []))
        {
            processSubject(subjectRef);
        }
        
        /*** HELPERS ***/
        function processRole(roleRef: RoleRef)
        {
            if (roleRef.kind === 'ClusterRole')
            {
                const roleDn = helpers.k8s.makeDn(null, config.apiVersion!, roleRef.kind, roleRef.name);
                if (!processRoleDn(roleDn))
                {
                    item.raiseAlert(ValidatorID.MISSING_ROLE, `Could not find ${roleRef.kind} ${roleRef.name}.`);
                }
            }
            else if (roleRef.kind === 'Role')
            {
                const targetNamespace = namespace || null;
                const roleDn = helpers.k8s.makeDn(targetNamespace, config.apiVersion!, roleRef.kind, roleRef.name);

                if (!processRoleDn(roleDn))
                {
                    item.raiseAlert(ValidatorID.MISSING_ROLE, `Could not find ${roleRef.kind} ${targetNamespace} :: ${roleRef.name}.`);
                }
            }
        }

        function processRoleDn(roleDn: string)
        {
            const role = item.link(LogicLinkKind.role, roleDn);
            if (!role)
            {
                return false;
            }

            runtime.rules = (<LogicRoleRuntime>role.runtime).rules;

            const linkNamingParts = [
                config.kind,
                metadata.namespace,
                metadata.name
            ];
            const linkNaming = _.filter(linkNamingParts, x => x).map(x => x!).join('::');

            role.link(LogicLinkKind.binding, item, linkNaming);
            return false;
        }

        function processSubject(subjectRef: Subject)
        {
            if (subjectRef.kind === 'ServiceAccount')
            {
                processServiceAccount(subjectRef);
                return;
            }

            if (subjectRef.kind === 'Group' || subjectRef.kind === 'User')
            {
                processUserGroup(subjectRef);
            }
        }

        function processServiceAccount(subjectRef: Subject)
        {
            const targetNamespace = subjectRef.namespace || namespace || null;
            const subjectDn = helpers.k8s.makeDn(targetNamespace, 'v1', subjectRef.kind, subjectRef.name);

            const linkNamingParts = [subjectRef.kind];
            if (targetNamespace) {
                linkNamingParts.push(targetNamespace);
            }
            linkNamingParts.push(subjectRef.name);
            const linkNaming = linkNamingParts.join('_');

            const svcAccount = item.link(LogicLinkKind.subject, subjectDn, linkNaming);
            if (!svcAccount) { 
                if (targetNamespace) {
                    item.raiseAlert(ValidatorID.MISSING_BINDING_TO_SERVICE_ACCOUNT, `Could not find ${subjectRef.kind} ${targetNamespace} :: ${subjectRef.name}.`);
                } else {
                    item.raiseAlert(ValidatorID.MISSING_BINDING_TO_SERVICE_ACCOUNT, `Could not find ${subjectRef.kind} ${subjectRef.name}.`);
                }
            } else {
                helpers.roles.linkSubjectToBinding(svcAccount, item, config);
            }
        }

        function processUserGroup(subjectRef: Subject)
        {
            const rbacRoot = scope.logicRootNode.fetchByNaming(NodeKind.rbac);
            let subjectItem : LogicItem | null = null; 

            if (subjectRef.kind === 'Group')
            {
                subjectItem = rbacRoot.fetchByNaming(NodeKind.group, subjectRef.name);
            }
            else if (subjectRef.kind === 'User')
            {
                subjectItem = rbacRoot.fetchByNaming(NodeKind.user, subjectRef.name);
            }

            if (!subjectItem) {
                return;
            }

            const linkNamingParts = [subjectRef.kind];
            linkNamingParts.push(subjectRef.name);
            const linkNaming = linkNamingParts.join('_');

            item.link(LogicLinkKind.subject, subjectItem, linkNaming);
            helpers.roles.linkSubjectToBinding(subjectItem, item, config);

            helpers.shadow.create(item, subjectItem, 
                {
                    kind: helpers.roles.getTargetBindingKind(config),
                    linkName: LogicLinkKind.k8s,
                    inverseLinkName: LogicLinkKind.rbac,
                    inverseLinkPath: `${subjectRef.kind}::${subjectRef.name}`
                })
        }

    })
    ;
