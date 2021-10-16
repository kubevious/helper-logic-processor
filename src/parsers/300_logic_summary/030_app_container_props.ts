import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicContainerParser()
    .handler(({ logger, scope, item, runtime }) => {

        const builder = item.buildProperties();

        builder.add('Volumes', item.countItemsByPath({ path: [ NodeKind.vol ] }));
        builder.add('ConfigMap Volumes', item.countItemsByPath({ path: [ NodeKind.vol, NodeKind.configmap ] }));
        builder.add('Secret Volumes', item.countItemsByPath({ path: [ NodeKind.vol, NodeKind.secret ] }));

        builder.build();
    })
    ;