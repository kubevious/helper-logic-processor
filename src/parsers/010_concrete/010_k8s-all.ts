import _ from 'the-lodash';
import { LogicItem } from '../../';
import { ConcreteParser } from '../../parser-builder';

import { makeDn, RnInfo } from '../../utils/dn-utils';


export default ConcreteParser()
    .target(null)
    .handler(({ logger, scope, item, helpers }) => {

        const config = item.config;

        if (config.synthetic) {
            return;
        }

        const root = scope.logicRootNode.fetchByNaming('k8s', '');

        const infraRoot = scope.logicRootNode.fetchByNaming('infra');
        let infraApiRoot = infraRoot.fetchByNaming('k8s');

        let namespaceRoot : LogicItem | null = null;
        let scopeRoot : LogicItem;
        if (item.id.namespace) {
            namespaceRoot = root.fetchByNaming('ns', item.id.namespace);
            scopeRoot = namespaceRoot;
        } else {
            scopeRoot = root.fetchByNaming('cluster', '');
        }

        let apiRoot : LogicItem = scopeRoot;
        if (item.id.apiName) {
            apiRoot = apiRoot.fetchByNaming('api', item.id.apiName);
            infraApiRoot = infraApiRoot.fetchByNaming('api', item.id.apiName);
        }

        const apiVersionRoot = apiRoot.fetchByNaming('version', item.id.version);
        const infraApiVersionRoot = infraApiRoot.fetchByNaming('version', item.id.version);

        const kindRoot = apiVersionRoot.fetchByNaming('kind', item.id.kind);
        const infraApiKindRoot = infraApiVersionRoot.fetchByNaming('kind', item.id.kind);

        const logicItem = kindRoot.fetchByNaming('resource', config.metadata.name!)

        logicItem.setConfig(config);

        helpers.k8s.makeConfigProps(logicItem, config);
        helpers.k8s.makeLabelsProps(logicItem, config);
        helpers.k8s.makeAnnotationsProps(logicItem, config);

        if (item.id.namespace) {
            const nsUsageItem = infraApiKindRoot.fetchByNaming('ns', item.id.namespace!)
            nsUsageItem.link('namespace', namespaceRoot!);
        }

    })
    ;