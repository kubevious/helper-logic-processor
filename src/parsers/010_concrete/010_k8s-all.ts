import _ from 'the-lodash';
import { LogicItem } from '../../item';
import { ConcreteParser } from '../../parser-builder';

export default ConcreteParser()
    .target(null)
    .handler(({ logger, scope, item, helpers }) => {

        const config = item.config;

        if (config.synthetic) {
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
            apiRoot = apiRoot.fetchByNaming('api', item.id.apiName);
        }

        const apiVersionRoot = apiRoot.fetchByNaming('version', item.id.version);

        const kindRoot = apiVersionRoot.fetchByNaming('kind', item.id.kind);

        const logicItem = kindRoot.fetchByNaming('resource', config.metadata.name!)

        logicItem.setConfig(config);

        helpers.k8s.makeConfigProps(logicItem, config)
        helpers.k8s.makeLabelsProps(logicItem, config)
        helpers.k8s.makeAnnotationsProps(logicItem, config)
    })
    ;