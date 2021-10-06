import _ from 'the-lodash';
import { K8sStorageClassParser } from '../../parser-builder/k8s';

export default K8sStorageClassParser()
    .handler(({ logger, scope, config, item, metadata, runtime, helpers }) => {

        item.buildProperties()
            .add('Volume Count', runtime.volumeCount)
            .add('Capacity', runtime.capacity)
            .build();

    })
    ;
