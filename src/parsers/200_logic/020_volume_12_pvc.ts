import _ from 'the-lodash';
import { LogicVolumeParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicPvRuntime } from '../../types/parser/logic-pv';
import { ValidatorID } from '@kubevious/entity-meta';

export default LogicVolumeParser()
    .handler(({ logger, item, config, helpers, runtime }) => {

        {
            const pvcConfig = config.persistentVolumeClaim;
            if (pvcConfig)
            {
                if (pvcConfig.claimName)
                {
                    findAndProcessPvc(pvcConfig.claimName);
                }
            }
        }
        

        /*** HELPERS **/

        function findAndProcessPvc(name: string)
        {
            const k8sPvc = helpers.k8s.findItem(runtime.namespace, 'v1', 'PersistentVolumeClaim', name);
            if (k8sPvc)
            {
                const volumePv = helpers.shadow.create(k8sPvc, item, 
                    {
                        kind: NodeKind.pvc,
                        linkName: 'k8s',
                        inverseLinkName: 'logic',
                        inverseLinkPath: `${runtime.app}-${item.naming}`,
                        skipUsageRegistration: true
                    });
                    
                (<LogicPvRuntime>volumePv.runtime).namespace = runtime.namespace;
                (<LogicPvRuntime>volumePv.runtime).app = runtime.app;                    
            }
            else
            {
                item.raiseAlert(ValidatorID.MISSING_PVC, `Could not find PersistentVolumeClaim ${name}`);
            }
        }

    })
    ;
