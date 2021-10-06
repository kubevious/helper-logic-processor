import _ from 'the-lodash';
import { Volume } from 'kubernetes-types/core/v1';
import { LogicPodParser } from '../../parser-builder/logic';

export default LogicPodParser()
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
            const k8sPvc = pvc.link('k8s-owner', k8sPvcDn);
            if (!k8sPvc) {
                return;
            }

            pvc.makeShadowOf(k8sPvc);
        }

    })
    ;
