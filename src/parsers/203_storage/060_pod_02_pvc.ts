import _ from 'the-lodash';
import { Volume } from 'kubernetes-types/core/v1';
import { LogicPodParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicPodParser()
    .handler(({ logger, config, item, runtime, helpers }) => {

        if (!config.spec) {
            return;
        }
        if (!config.spec.volumes) {
            return;
        }

        for(const volume of config.spec.volumes)
        {
            processVolume(volume);
        }

        /*** HELPERS ***/
        function processVolume(volume: Volume)
        {
            if (!volume.persistentVolumeClaim) {
                return;
            }

            const pvcName = volume.persistentVolumeClaim.claimName;
            if (!pvcName) {
                return;
            }

            const pvc = item.fetchByNaming(NodeKind.pvc, pvcName);

            const k8sPvcDn = helpers.k8s.makeDn(runtime.namespace, 'v1', 'PersistentVolumeClaim', pvcName);
            const k8sPvc = pvc.link('k8s-owner', k8sPvcDn);
            if (!k8sPvc) {
                return;
            }

            pvc.makeShadowOf(k8sPvc);
        }

    })
    ;
