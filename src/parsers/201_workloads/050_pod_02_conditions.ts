import { Pod } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';

export default K8sParser<Pod>()
    .target({
        kind: "Pod"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        const conditions = config.status?.conditions ?? [];
        for(let condition of conditions) {
            if (condition.status != 'True') {
                let msg = `There was error with ${condition.type}.`;
                if (condition.message) {
                    msg += ' ' + condition.message;
                }
                item.addAlert(condition.type, 'error', msg);
            }
        }

    })
    ;
