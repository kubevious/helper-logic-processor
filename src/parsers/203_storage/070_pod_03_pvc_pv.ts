import _ from 'the-lodash';
import { LogicPodPvcParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicPvRuntime } from '../../types/parser/logic-pv';
import { LogicLinkKind } from '../../logic/link-kind';

export default LogicPodPvcParser()
    .handler(({ logger, config, item, runtime, helpers }) => {

        const volumeName = config?.spec?.volumeName;
        if (!volumeName) {
            return;
        }

        const k8sPv = helpers.k8s.findItem(null, 'v1', 'PersistentVolume', volumeName);
        if (k8sPv)
        {
            const logicPv = helpers.shadow.create(k8sPv, item,
                {
                    kind: NodeKind.pv,
                    linkName: LogicLinkKind.k8s,
                    inverseLinkName: LogicLinkKind.pod,
                    inverseLinkPath: `${runtime.namespace}-${config.metadata!.name!}`,
                });

            (<LogicPvRuntime>logicPv.runtime).namespace = runtime.namespace;
            (<LogicPvRuntime>logicPv.runtime).app = runtime.app;
        }
        
    })
    ;