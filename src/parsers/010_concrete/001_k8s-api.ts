import _ from 'the-lodash';
import { LogicItem } from '../../item';
import { ConcreteParser } from '../../parser-builder';

export default ConcreteParser()
    .target({
        synthetic: true,
        apiName: 'kubevious.io',
        kind: 'ApiResourceStatus'
    })
    .kind('resource')
    .handler(({ logger, scope, item }) => {

        const resources = _.get(item.config, 'config.resources');
        if (!resources) {
            return;
        }

        const infraRoot = scope.logicRootNode.fetchByNaming('infra', '');

        const root = infraRoot.fetchByNaming('k8s', '');

        for(let resource of resources)
        {
            let apiRoot : LogicItem = root;
            if (resource.apiName) {
                apiRoot = apiRoot.fetchByNaming('api', resource.apiName);
            } 

            let apiVersionRoot = apiRoot.fetchByNaming('version', resource.apiVersion);

            let kindRoot = apiVersionRoot.fetchByNaming('kind', resource.kindName);

            // kindRoot.data
        }
    })
    ;