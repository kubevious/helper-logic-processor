import _ from 'the-lodash';
import { PersistentVolumeClaim, Volume } from 'kubernetes-types/core/v1'

import { StatefulSet } from 'kubernetes-types/apps/v1';


import { LogicLauncherParser } from '../../parser-builder/logic';
import { LogicVolumeRuntime } from '../../types/parser/logic-volume';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime }) => {

        if (item.naming !== 'StatefulSet') {
            return;
        }

        const statefulSet = <StatefulSet>config;

        const app = item.parent!;
        const appRuntime = (<LogicAppRuntime>app.runtime);

        const templateList = statefulSet?.spec?.volumeClaimTemplates ?? [];
        for(const templateConfig of templateList)
        {
            processVolume(templateConfig);
        }

        /** HELPERS **/

        function processVolume(claimConfig: PersistentVolumeClaim)
        {
            const volumesParent = app.fetchByNaming(NodeKind.vols);

            const name = claimConfig.metadata?.name;
            if (!name) {
                return;
            }

            const volume = volumesParent.fetchByNaming(NodeKind.vol, name);
            volume.setConfig(claimConfig);
            (<LogicVolumeRuntime>volume.runtime).namespace = runtime.namespace;
            (<LogicVolumeRuntime>volume.runtime).app = app.naming;
            appRuntime.volumes[name] = volume.dn;

            volume.addProperties({
                kind: PropsKind.yaml,
                id: PropsId.config,
                config: claimConfig
            });
        }

    })
    ;
