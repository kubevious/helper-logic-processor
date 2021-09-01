import _ from 'the-lodash';
import { Pod, Volume } from 'kubernetes-types/core/v1';
import { LogicParser } from '../../parser-builder';

export default LogicParser<Pod>()
    // .trace()
    .target({
        path: ["logic", "ns", "app", "launcher", "replicaset", "pod"]
    })
    .target({
        path: ["logic", "ns", "app", "launcher", "pod"]
    })
    .handler(({ logger, config, item, helpers }) => {

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

            // volume.downwardAPI

            let pvc = item.fetchByNaming("pvc", pvcName);

            // scope.setK8sConfig(pvc, pvcScope.config);
            // pvcScope.registerItem(pvc);
            // pvcScope.markUsedBy(pvc);

            // let pvcScope = itemScope.parent.items.get('PersistentVolumeClaim', pvcName);
            // if (pvcScope)
            // {
            //     for(let podItem of itemScope.items)
            //     {
                    
            //     }
            // }
        }

    })
    ;
