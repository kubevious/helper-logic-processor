import _ from 'the-lodash';
import { Volume } from 'kubernetes-types/core/v1'

import { LogicLauncherParser } from '../../parser-builder/logic';
import { LogicVolumeRuntime } from '../../types/parser/logic-volume';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicItem } from '../..';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime }) => {

        const app = item.parent!;
        const appRuntime = (<LogicAppRuntime>app.runtime);

        const volumesList = config.spec?.template.spec?.volumes ?? [];
        if (volumesList.length > 0)
        {
            const volumesParent = app.fetchByNaming(NodeKind.vols, "Volumes");

            for(const volume of volumesList)
            {
                processVolume(volumesParent, volume);
            }
        }

        /** HELPERS **/

        function processVolume(volumesParent: LogicItem, volumeConfig: Volume)
        {
            const volume = volumesParent.fetchByNaming(NodeKind.vol, volumeConfig.name);
            volume.setConfig(volumeConfig);
            (<LogicVolumeRuntime>volume.runtime).namespace = runtime.namespace;
            appRuntime.volumes[volumeConfig.name] = volume.dn;

            volume.addProperties({
                kind: PropsKind.yaml,
                id: PropsId.config,
                title: "Config",
                order: 10,
                config: volumeConfig
            });
        }

    })
    ;
