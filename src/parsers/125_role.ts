import _ from 'the-lodash';
import { ConcreteParser } from '../parser-builder';

export default ConcreteParser()
    .order(125)
    .target({
        api: "rbac.authorization.k8s.io",
        kind: "ClusterRole"
    })
    .target({
        api: "rbac.authorization.k8s.io",
        kind: "Role"
    })
    .kind((item) => {
        if(item.config.kind == "Role") {
            return 'rl'
        }
        if(item.config.kind == "ClusterRole") {
            return 'crl'
        }
        throw new Error();
    })
    .needNamespaceScope(true)
    .namespaceNameCb((item) => {
        if(item.config.kind == "Role") {
            return item.config.metadata.namespace;
        }
        if(item.config.kind == "ClusterRole") {
            return '';
        }
        throw new Error();
    })
    .handler(({ scope, item, namespaceScope, createK8sItem, createAlert, helpers }) => {

        var roleScope = namespaceScope.items.getByConcrete(item)!;

        if (roleScope.hasNoOwner)
        {
            var rawContainer = scope.fetchRawContainer(item, item.config.kind + "s");
            var logicItem = createK8sItem(rawContainer);
            roleScope.registerItem(logicItem);
            createAlert('Unused', 'warn', item.config.kind + ' not used.');
        } 
        else
        {
            for(var owner of roleScope.owners)
            {
                var logicItem = createK8sItem(owner);
                roleScope.registerItem(logicItem);
                roleScope.markUsedBy(logicItem);
            }
        }

        for(var logicItem of roleScope.items)
        {
            logicItem.addProperties(roleScope.data.roleMatrixProps);
        }

        helpers.common.determineSharedFlag(roleScope);

    })
    ;