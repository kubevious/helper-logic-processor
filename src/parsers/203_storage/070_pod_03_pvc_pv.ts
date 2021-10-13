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

        const k8sPvDn = helpers.k8s.makeDn(null, 'v1', 'PersistentVolume', volumeName);

        const k8sVolume = item.link('volume', k8sPvDn);
        if (!k8sVolume) {
            return;
        }

        const pvItem = item.fetchByNaming(NodeKind.pv, volumeName);
        pvItem.makeShadowOf(k8sVolume);
        
    })
    ;