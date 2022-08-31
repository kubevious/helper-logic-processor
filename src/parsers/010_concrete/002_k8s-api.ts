import _ from 'the-lodash';
import { LogicItem } from '../../';
import { ConcreteParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';
import { ValidatorID, K8sApiResourceStatus } from '@kubevious/entity-meta';

export default ConcreteParser()
    .target({
        synthetic: true,
        apiName: 'kubevious.io',
        kind: 'ApiResourceStatus'
    })
    .handler(({ logger, scope, item }) => {

        const resources = _.get(item.config, 'config.resources') as K8sApiResourceStatus[] || [];

        const infraRoot = scope.logicRootNode.fetchByNaming(NodeKind.infra);

        const root = infraRoot.fetchByNaming(NodeKind.k8s);

        for(const resource of resources)
        {
            let apiRoot : LogicItem = root;
            if (resource.apiName) {
                apiRoot = apiRoot.fetchByNaming(NodeKind.api, resource.apiName);
            } 

            const apiVersionRoot = apiRoot.fetchByNaming(NodeKind.version, resource.version);

            const kindRoot = apiVersionRoot.fetchByNaming(NodeKind.kind, resource.kindName);

            kindRoot.addProperties({
                kind: PropsKind.yaml,
                id: PropsId.config,
                config: resource
            });

            if (!resource.isDisabled && !resource.isSkipped)
            {
                if (resource.isDisconnected) {
                    kindRoot.raiseAlert(ValidatorID.API_SERVICE_DISCONNECTED, 'API Service is disconnected.');
                }
    
                {
                    const errorMsg = resource.error?.message;
                    if (errorMsg) {
                        kindRoot.raiseAlert(ValidatorID.API_SERVICE_CONNECTION_ERROR, `${errorMsg}. Code: ${resource.error?.code}`);
                    }
                }
            }
        }
    })
    ;