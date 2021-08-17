import _ from 'the-lodash';
import { ConcreteParser } from '../../parser-builder';

export default ConcreteParser()
    .target({
        apiName: "rbac.authorization.k8s.io",
        kind: "RoleBinding"
    })
    .target({
        apiName: "rbac.authorization.k8s.io",
        kind: "ClusterRoleBinding"
    })
    .kind((item) => {
        if(item.config.kind == "RoleBinding") {
            return 'rlbndg'
        }
        if(item.config.kind == "ClusterRoleBinding") {
            return 'crlbndg'
        }
        throw new Error();
    })
    .needNamespaceScope(true)
    .namespaceNameCb((item) => {
        if(item.config.kind == "RoleBinding") {
            return item.config.metadata.namespace!;
        }
        if(item.config.kind == "ClusterRoleBinding") {
            return '';
        }
        throw new Error();
    })
    .handler(({ scope, item, namespaceScope, createK8sItem, createAlert, helpers }) => {

        let bindingScope = namespaceScope.items.register(item.config);

        let targetNamespaceName = null;
        if(item.config.kind == "RoleBinding") {
            targetNamespaceName = item.config.metadata.namespace;
        } else if(item.config.kind == "ClusterRoleBinding") {
            targetNamespaceName = '*';
        }

        let subjects = item.config.subjects;
        if (subjects)
        {
            for(let subject of subjects)
            {
                if (subject.kind == 'ServiceAccount')
                {
                    let subjNamespaceName = namespaceScope.name;
                    if (subject.namespace) {
                        subjNamespaceName = subject.namespace;
                    }
                    let subjNamespaceScope = scope.getNamespaceScope(subjNamespaceName);
                    let serviceAccountScope = subjNamespaceScope.items.get('ServiceAccount', subject.name);
                    if (serviceAccountScope) {
                        if (!serviceAccountScope.data.bindings) {
                            serviceAccountScope.data.bindings = [];
                        }
                        serviceAccountScope.data.bindings.push(bindingScope);

                        for (let serviceAccount of serviceAccountScope.items)
                        {
                            let logicItem = createK8sItem(serviceAccount);
                            bindingScope.registerItem(logicItem);
                            bindingScope.markUsedBy(logicItem);

                            if (subjNamespaceName != targetNamespaceName)
                            {
                                logicItem.setPropagatableFlag("xnamespace");
                            }
                        } 
                    }
                    else
                    {
                        createAlert('Missing', 'error', 'Could not find ' + subject.namespace + '::' + subject.name + ' ServiceAccount.');
                    }
                }
            }
        }

        if (item.config.roleRef)
        {
            let targetNamespaceScope;
            if (item.config.roleRef.kind == 'ClusterRole') {
                targetNamespaceScope = scope.getNamespaceScope('');
            } else {
                targetNamespaceScope = namespaceScope;
            }
            let targetRoleScope = targetNamespaceScope.items.get(item.config.roleRef.kind, item.config.roleRef.name);
            if (targetRoleScope)
            {
                if (!bindingScope.data.roles) {
                    bindingScope.data.roles = [];
                }
                bindingScope.data.roles.push(targetRoleScope);

                for(let logicItem of bindingScope.items)
                {
                    targetRoleScope.registerOwnerItem(logicItem);
                }
            }
            else
            {
                createAlert('Missing', 'error', 'Unresolved ' + item.config.roleRef.kind + ' ' + item.config.roleRef.name);
            }
        }

        if (bindingScope.isNotUsed)
        {
            let rawContainer = scope.fetchRawContainer(item, item.config.kind + "s");
            let logicItem = createK8sItem(rawContainer);
            bindingScope.registerItem(logicItem);
            createAlert('Unused', 'warn', logicItem.prettyKind + ' not used.');
        } 

        bindingScope.data.rules = helpers.roles.makeRulesMap();
        let roleScopes = bindingScope.data.roles;
        if (roleScopes)
        {
            for(let roleScope of roleScopes)
            {
                bindingScope.data.rules = helpers.roles.combineRulesMap(
                    bindingScope.data.rules,
                    roleScope.data.rules,
                    targetNamespaceName!);
            }
        }
        bindingScope.data.rules = helpers.roles.optimizeRulesMap(bindingScope.data.rules);

        let propsConfig = helpers.roles.buildRoleMatrix(bindingScope.data.rules);
        bindingScope.addPropertyGroup(propsConfig);

        helpers.common.determineSharedFlag(bindingScope);

    })
    ;