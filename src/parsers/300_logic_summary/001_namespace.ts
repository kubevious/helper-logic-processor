import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicNamespaceParser()
    .handler(({ logger, scope, item }) => {

        const secretCount = 
            scope.countItemsByPath({ path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.cont, NodeKind.vol, NodeKind.secret ]}) +
            scope.countItemsByPath({ path: [ NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.initcont, NodeKind.vol, NodeKind.secret]});

        item.buildProperties()
            .add('Applications', item.countChildrenByKind(NodeKind.app)) 
            .add('Ingresses', scope.countItemsByPath({ path: [NodeKind.logic, NodeKind.ns, NodeKind.app, NodeKind.ingress]})) 
            .add('Secrets', secretCount) 
            .build();
            
    })
    ;