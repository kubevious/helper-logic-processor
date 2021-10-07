import _ from 'the-lodash';
import { InfraStorageClassParser } from '../../parser-builder/infra';
import { InfraPersistentVolumeRuntime } from '../../types/parser/infra-pv';

export default InfraStorageClassParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        runtime.volumeCount = 0;

        runtime.capacity = {
            value: 0,
            unit: 'bytes'
        };

        for(const pv of item.getChildrenByKind('pv'))
        {
            runtime.volumeCount++;
            
            const pvRuntime = <InfraPersistentVolumeRuntime>pv.runtime;
            if (pvRuntime.capacity) {
                runtime.capacity.value += pvRuntime.capacity.value;
            }
        }

    })
    ;
