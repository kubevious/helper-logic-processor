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

            const k8sPvc = helpers.k8s.findItem(runtime.namespace, 'v1', 'PersistentVolumeClaim', pvcName);
            if (k8sPvc)
            {
                helpers.shadow.create(k8sPvc, item,
                    {
                        kind: NodeKind.pvc,
                        linkName: 'k8s-owner',
                        inverseLinkName: 'logic'
                    });
            }
        }

    })
    ;
