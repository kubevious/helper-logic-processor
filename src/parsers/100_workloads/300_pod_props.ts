import { PodPhase } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';
import _ from 'the-lodash';
import { K8sPodParser } from '../../parser-builder/k8s';

export default K8sPodParser()
    .handler(({ logger, config, item, metadata, helpers, scope, runtime }) => {

        const props = item.buildProperties()
            .add('Phase', runtime.phase);

        if (runtime.runStage) {
            props.add("Run Stage", runtime.runStage);
        }

        if (_.keys(runtime.failureReasons).length > 0) {
            const list = _.chain(runtime.failureReasons)
                          .keys()
                          .orderBy()
                          .value();  
            props.add('Failure Reasons', list.join(", "));
        }

        if (runtime.restartCount > 0) {
            props.add('Restart Count', runtime.restartCount);
        }

        if (runtime.phase !== PodPhase.Succeeded)
        {
            for(const condition of runtime.conditions)
            {
                props.add(`Condition ${condition.type}`, condition.state);
            }
        }

        props.build();
    })
    ;
