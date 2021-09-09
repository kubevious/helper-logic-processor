import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic';

export default LogicAppParser()
    .handler(({ logger, scope, item, runtime }) => {

        const builder = item.buildProperties();
        
        makeReplicas();

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
    })
    ;