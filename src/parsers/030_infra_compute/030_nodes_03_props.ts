import _ from 'the-lodash';
import { InfraNodesParser } from '../../parser-builder/infra';

export default InfraNodesParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        item.buildProperties()
            .add('node count', runtime.nodeCount)
            .add('pool count', runtime.poolCount)
            .build();

    })
    ;

