import _ from 'the-lodash';
import { InfraStorageClassParser } from '../../parser-builder/infra';

export default InfraStorageClassParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        item.buildProperties()
            .add('Volume Count', runtime.volumeCount)
            .add('Capacity', runtime.capacity)
            .build();

    })
    ;
