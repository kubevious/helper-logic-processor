import _ from 'the-lodash';
import { K8sStorageClassParser } from '../../parser-builder/k8s';
import { InfraPersistentVolumeRuntime } from '../../types/parser/infra-pv';

export default K8sStorageClassParser()
    .handler(({ logger, scope, config, item, metadata, runtime, helpers }) => {

        runtime.volumeCount = 0;

        runtime.capacity = {
            value: 0,
            unit: 'bytes'
        };

        for(let pv of item.resolveSourceLinkItems('storage-class'))
        {
            runtime.volumeCount++;
            
            const pvRuntime = <InfraPersistentVolumeRuntime>pv.runtime;
            if (pvRuntime.capacity) {
                runtime.capacity.value += pvRuntime.capacity.value;
            }
        }

    })
    ;
