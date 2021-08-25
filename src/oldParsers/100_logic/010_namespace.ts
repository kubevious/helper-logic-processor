import _ from 'the-lodash';
import { ConcreteParser } from '../../parser-builder';

export default ConcreteParser()
    .target({
        apiName: null,
        kind: "Namespace"
    })
    .kind('ns')
    .handler(({ scope, item, createK8sItem }) => {
        createK8sItem(scope.logicRootNode);

        let labels = _.get(item.config, 'metadata.labels');
        scope.registerNamespaceLabels(item.config.metadata.name, labels);
    })
    ;