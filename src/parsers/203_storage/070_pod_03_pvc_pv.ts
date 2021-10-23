import _ from 'the-lodash';
import { LogicPodPvcParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicPodPvcParser()
    .handler(({ logger, config, item, runtime, helpers }) => {
        
        if (!config.spec) {
            return;
        }

        const volumeName = config.spec.volumeName;
        if (!volumeName) {
            return;
        }

        const k8sPv = helpers.k8s.findItem(null, 'v1', 'PersistentVolume', volumeName);
        if (k8sPv)
        {
            helpers.shadow.create(k8sPv, item,
                {
                    kind: NodeKind.pv,
                    linkName: 'k8s',
                    inverseLinkName: 'logic'
                    // inverseLinkPath: namespace-app-name
                });
        }
        
    })
    ;