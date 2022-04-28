import { PodPhase } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';
import _ from 'the-lodash';
import { K8sPodParser } from '../../parser-builder/k8s';

export default K8sPodParser()
    .handler(({ logger, config, item, metadata, helpers, scope, runtime }) => {
        
        runtime.phase = (config.status?.phase as PodPhase) ?? PodPhase.Unknown;
        runtime.conditions = [];
        runtime.failureReasons = {};

    })
    ;
