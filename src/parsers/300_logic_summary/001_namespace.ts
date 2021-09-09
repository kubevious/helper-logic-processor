import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic';

export default LogicNamespaceParser()
    .handler(({ logger, scope, item }) => {

        const secretCount = 
            scope.countItemsByPath({ path: ['logic', 'ns', 'app', 'cont', 'vol', 'secret']}) +
            scope.countItemsByPath({ path: ['logic', 'ns', 'app', 'initcont', 'vol', 'secret']});

        item.buildProperties()
            .add('Applications', item.countChildrenByKind('app')) 
            .add('Ingresses', scope.countItemsByPath({ path: ['logic', 'ns', 'app', 'ingress']})) 
            .add('Secrets', secretCount) 
            .build();
            
    })
    ;