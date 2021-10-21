import _ from 'the-lodash';
import { LogicItem } from '../../';
import { ConcreteParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

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

            kindRoot.addProperties({
                kind: PropsKind.yaml,
                id: PropsId.config,
                title: "Config",
                order: 10,
                config: resource
            });

            if (resource.isDisconnected && !resource.isDisabled) {
                kindRoot.addAlert('Disconnected', 'warn', 'API Service is disconnected.');
            }

            {
                const errorMsg = resource.error?.message;
                if (errorMsg) {
                    kindRoot.addAlert('Error', 'error', `${errorMsg}. Code: ${resource.error?.code}`);
                }
            }
        }
    })
    ;