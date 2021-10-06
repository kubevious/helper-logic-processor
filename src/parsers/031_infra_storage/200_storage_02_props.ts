import _ from 'the-lodash';
import { InfraStorageParser } from '../../parser-builder/infra';

export default InfraStorageParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        item.buildProperties()
            .add('Volume Count', runtime.volumeCount)
            .add('Capacity', runtime.capacity)
            .build();

    })
    ;
