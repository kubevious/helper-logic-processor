import _ from 'the-lodash';
import { LogicItem } from '../../';
import { ConcreteParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';

export default ConcreteParser()
    .target(null)
    .handler(({ logger, scope, item, helpers }) => {

        const config = item.config;

        if (config.synthetic) {
            return;
        }

        const root = scope.logicRootNode.fetchByNaming(NodeKind.k8s);

        const infraRoot = scope.logicRootNode.fetchByNaming(NodeKind.infra);
        let infraApiRoot = infraRoot.fetchByNaming(NodeKind.k8s);

        let namespaceRoot : LogicItem | null = null;
        let scopeRoot : LogicItem;
        if (item.id.namespace) {
            namespaceRoot = root.fetchByNaming(NodeKind.ns, item.id.namespace);
            scopeRoot = namespaceRoot;
        } else {
            scopeRoot = root.fetchByNaming(NodeKind.cluster);
        }

        let apiRoot : LogicItem = scopeRoot;
        if (item.id.apiName) {
            apiRoot = apiRoot.fetchByNaming(NodeKind.api, item.id.apiName);
            infraApiRoot = infraApiRoot.fetchByNaming(NodeKind.api, item.id.apiName);
        }

        const apiVersionRoot = apiRoot.fetchByNaming(NodeKind.version, item.id.version);
        const infraApiVersionRoot = infraApiRoot.fetchByNaming(NodeKind.version, item.id.version);

        const kindRoot = apiVersionRoot.fetchByNaming(NodeKind.kind, item.id.kind);
        const infraApiKindRoot = infraApiVersionRoot.fetchByNaming(NodeKind.kind, item.id.kind);

        const logicItem = kindRoot.fetchByNaming(NodeKind.resource, config.metadata.name!)

        logicItem.setConfig(config);

        helpers.k8s.makeConfigProps(logicItem, config);
        helpers.k8s.makeLabelsProps(logicItem, config);
        helpers.k8s.makeAnnotationsProps(logicItem, config);

        if (item.id.namespace) {
            const nsUsageItem = infraApiKindRoot.fetchByNaming(NodeKind.ns, item.id.namespace!)
            nsUsageItem.link('nsapi', kindRoot!);
        } else {
            const clusterUsageItem = infraApiKindRoot.fetchByNaming(NodeKind.cluster);
            clusterUsageItem.link('cluster', kindRoot!);
        }

    })
    ;