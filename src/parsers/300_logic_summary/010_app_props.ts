import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic';

export default LogicAppParser()
    .handler(({ logger, scope, item, runtime }) => {

        const builder = item.buildProperties();
        

        builder.add('Launcher', runtime.launcherKind);

        if (runtime.launcherKind == "Deployment" || 
            runtime.launcherKind == "StatefulSet")
        {
            makeReplicas();
        }

        builder.add('Container Count', runtime.containerCount);
        builder.add('Init Container Count', runtime.initContainerCount);
        builder.add('Volumes', _.keys(runtime.volumes).length);

        builder.add('Exposed', determineExposedMode());

        builder.build();

        /*** HELPERS **/
        function makeReplicas()
        {
            const parts = [];
            if (_.isNotNullOrUndefined(runtime.launcherReplicas)) {
                parts.push(runtime.launcherReplicas);
            }
            if (runtime.hpa) {
                parts.push(`[${runtime.hpa.min}, ${runtime.hpa.max}]`);
            }
            if (!parts.length) {
                return;
            }

            builder.add('Replicas', parts.join(' ')) ;
        }

        function determineExposedMode()
        {
            if (runtime.exposedWithIngress) {
                return 'With Ingress'
            }

            if (runtime.exposedWithService) {
                return 'With Service'
            }

            return 'No';
        }
    })
    ;