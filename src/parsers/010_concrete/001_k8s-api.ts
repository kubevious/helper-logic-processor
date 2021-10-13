import _ from 'the-lodash';
import { LogicItem } from '../../';
import { ConcreteParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';

export default ConcreteParser()
    .target({
        synthetic: true,
        apiName: 'kubevious.io',
        kind: 'ApiResourceStatus'
    })
    .handler(({ logger, scope, item }) => {

        const resources = _.get(item.config, 'config.resources');
        if (!resources) {
            return;
        }

        const infraRoot = scope.logicRootNode.fetchByNaming(NodeKind.infra);

        const root = infraRoot.fetchByNaming(NodeKind.k8s);

        for(const resource of resources)
        {
            let apiRoot : LogicItem = root;
            if (resource.apiName) {
                apiRoot = apiRoot.fetchByNaming(NodeKind.api, resource.apiName);
            } 

            const apiVersionRoot = apiRoot.fetchByNaming(NodeKind.version, resource.apiVersion);

            const kindRoot = apiVersionRoot.fetchByNaming(NodeKind.kind, resource.kindName);

            // kindRoot.data
        }
    })
    ;