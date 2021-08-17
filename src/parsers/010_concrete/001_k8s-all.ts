import _ from 'the-lodash';
import { LogicItem } from '../../item';
import { ConcreteParser } from '../../parser-builder';

export default ConcreteParser()
    .target(null)
    .kind('resource')
    .handler(({ logger, scope, item, createK8sItem }) => {

        if (item.config.synthetic) {
            return;
        }

        const root = scope.logicRootNode.fetchByNaming('k8s', '');

        let scopeRoot : LogicItem;
        if (item.id.namespace) {
            scopeRoot = root.fetchByNaming('ns', item.id.namespace);
        } else {
            scopeRoot = root.fetchByNaming('cluster', '');
        }

        let apiRoot : LogicItem = scopeRoot;
        if (item.id.apiName) {
            apiRoot = scopeRoot.fetchByNaming('api', item.id.apiName);
        }

        let apiVersionRoot = apiRoot.fetchByNaming('version', item.id.version);

        let kindRoot = apiVersionRoot.fetchByNaming('kind', item.id.kind);

        createK8sItem(kindRoot, item);
    })
    ;