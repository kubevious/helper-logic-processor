import _ from 'the-lodash';
import { ConcreteParser } from '../../parser-builder';

export default ConcreteParser()
    .target(null)
    .handler(({ scope, item }) => {

        if (_.isNull(item.id.api) && item.id.kind == 'Namespace')
        {
            scope.getNamespaceScope(item.id.name);
        }
        else if (item.id.namespace)
        {
            let namespaceScope = scope.getNamespaceScope(item.id.namespace);
            namespaceScope.items.register(item.config);
        } else {
            scope.getInfraScope().items.register(item.config);
        }

    })
    ;