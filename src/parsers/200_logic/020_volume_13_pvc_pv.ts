import _ from 'the-lodash';
import { LogicVolumePvcParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicPvRuntime } from '../../types/parser/logic-pv';

export default LogicVolumePvcParser()
    .handler(({ logger, item, config, helpers, runtime }) => {

        const volumeName = config?.spec?.volumeName;
        if (!volumeName) {
            return;
        }

        const volumeItem = item.parent!;

        const k8sPv = helpers.k8s.findItem(null, 'v1', 'PersistentVolume', volumeName);
        if (k8sPv)
        {
            const logicPv = helpers.shadow.create(k8sPv, item,
                {
                    kind: NodeKind.pv,
                    linkName: 'k8s',
                    inverseLinkName: 'logic',
                    inverseLinkPath: `${runtime.namespace}-${runtime.app}-${volumeItem.naming}`,
                    skipUsageRegistration: true
                });

            (<LogicPvRuntime>logicPv.runtime).namespace = runtime.namespace;
            (<LogicPvRuntime>logicPv.runtime).app = runtime.app;
        }
        else
        {
            item.addAlert("MissingPv", "error", `Could not find PersistentVolume ${volumeName}`);
        }


    })
    ;
