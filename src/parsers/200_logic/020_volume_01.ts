import _ from 'the-lodash';
import { Volume } from 'kubernetes-types/core/v1'

import { LogicLauncherParser } from '../../parser-builder/logic';
import { LogicVolumeRuntime } from '../../types/parser/logic-volume';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime }) => {

        const app = item.parent!;
        const appRuntime = (<LogicAppRuntime>app.runtime);

        const volumesList = runtime.podTemplateSpec?.spec?.volumes ?? [];
        for(const volume of volumesList)
        {
            processVolume(volume);
        }

        /** HELPERS **/

        function processVolume(volumeConfig: Volume)
        {
            const volumesParent = app.fetchByNaming(NodeKind.vols);

            const volume = volumesParent.fetchByNaming(NodeKind.vol, volumeConfig.name);
            volume.setConfig(volumeConfig);
            (<LogicVolumeRuntime>volume.runtime).namespace = runtime.namespace;
            (<LogicVolumeRuntime>volume.runtime).app = app.naming;
            appRuntime.volumes[volumeConfig.name] = volume.dn;

            volume.addProperties({
                kind: PropsKind.yaml,
                id: PropsId.config,
                config: volumeConfig
            });
        }

    })
    ;
