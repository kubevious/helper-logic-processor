import _ from 'the-lodash';
import { InfraNodePoolParser } from '../../parser-builder/infra';

export default InfraNodePoolParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        item.buildProperties()
            .add('node count', runtime.nodeCount)
            .build();

    })
    ;

