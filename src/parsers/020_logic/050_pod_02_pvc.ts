import _ from 'the-lodash';
import { Pod, Volume } from 'kubernetes-types/core/v1';
import { LogicParser } from '../../parser-builder';
import { LogicPodRuntime } from '../../types/parser/logic-pod';

export default LogicParser<Pod, LogicPodRuntime>()
    .target({
        path: ["logic", "ns", "app", "launcher", "replicaset", "pod"]
    })
    .target({
        path: ["logic", "ns", "app", "launcher", "pod"]
    })
    .handler(({ logger, config, item, runtime, helpers }) => {

        if (!config.spec) {
            return;
        }
        if (!config.spec.volumes) {
            return;
        }

        for(let volume of config.spec.volumes)
        {
            processVolume(volume);
        }

        /*** HELPERS ***/
        function processVolume(volume: Volume)
        {
            if (!volume.persistentVolumeClaim) {
                return;
            }

            let pvcName = volume.persistentVolumeClaim.claimName;
            if (!pvcName) {
                return;
            }

            let pvc = item.fetchByNaming("pvc", pvcName);

            const k8sPvcDn = helpers.k8s.makeDn(runtime.namespace, 'v1', 'PersistentVolumeClaim', pvcName);
            pvc.link('k8s-owner', k8sPvcDn);

            const k8sPvc = pvc.resolveLink('k8s-owner');
            if (k8sPvc) {
                pvc.makeShadowOf(k8sPvc);
            }
        }

    })
    ;
