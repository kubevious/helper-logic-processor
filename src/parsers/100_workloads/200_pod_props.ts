import { PodPhase, PodRunStage } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';
import _ from 'the-lodash';
import { K8sPodParser } from '../../parser-builder/k8s';

export default K8sPodParser()
    .handler(({ logger, config, item, metadata, helpers, scope, runtime }) => {

        const props = item.buildProperties()
            .add('Phase', runtime.phase);

        if (runtime.runStage) {
            props.add("Run Stage", runtime.runStage);

            for(const condition of runtime.conditions)
            {
                props.add(`Condition ${condition.type}`, condition.state);
            }
        }

        props.build();
    })
    ;
