import _ from 'the-lodash';
import { PersistentVolume, Volume } from 'kubernetes-types/core/v1';
import { K8sParser } from '../../parser-builder';

export default K8sParser<PersistentVolume>()
    .trace()
    .target({
        clustered: true,
        kind: "PersistentVolume"
    })
    .handler(({ logger, config, item, runtime, helpers }) => {

      

    })
    ;
