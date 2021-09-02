import _ from 'the-lodash';
import { PersistentVolumeClaim } from 'kubernetes-types/core/v1';
import { LogicParser } from '../../parser-builder';
import { LogicPodRuntime } from '../../types/parser/logic-pod';

export default LogicParser<PersistentVolumeClaim, LogicPodRuntime>()
    .target({
        path: ["logic", "ns", "app", "launcher", "replicaset", "pod", "pvc"]
    })
    .target({
        path: ["logic", "ns", "app", "launcher", "pod", "pvc"]
    })
    .handler(({ logger, config, item, runtime, helpers }) => {
        
        if (!config.spec) {
            return;
        }

        const volumeName = config.spec.volumeName;
        if (!volumeName) {
            return;
        }

        const k8sPvDn = helpers.k8s.makeDn(null, 'v1', 'PersistentVolume', volumeName);

        const k8sVolume = item.link('volume', k8sPvDn);
        if (!k8sVolume) {
            return;
        }

        const pvItem = item.fetchByNaming('pv', volumeName);
        pvItem.makeShadowOf(k8sVolume);
        
    })
    ;