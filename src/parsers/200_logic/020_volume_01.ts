import _ from 'the-lodash';
import { Volume } from 'kubernetes-types/core/v1'

import { LogicLauncherParser } from '../../parser-builder/logic';
import { LogicVolumeRuntime } from '../../types/parser/logic-volume';
import { LogicAppRuntime } from '../../types/parser/logic-app';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime }) => {

        if (!config.spec) {
            return;
        }
        if (!config.spec.template.spec) {
            return;
        }

        const volumesList = config.spec.template.spec.volumes;
        if (!volumesList || volumesList.length == 0) {
            return;
        }

        const app = item.parent!;
        const volumesParent = app.fetchByNaming("vols", "Volumes");

        for(let volume of volumesList)
        {
            processVolume(volume);
        }

        /** HELPERS **/

        function processVolume(volumeConfig: Volume)
        {
            const volume = volumesParent.fetchByNaming('vol', volumeConfig.name);
            volume.setConfig(volumeConfig);
            (<LogicVolumeRuntime>volume.runtime).namespace = runtime.namespace;
            (<LogicAppRuntime>app.runtime).volumes[volumeConfig.name] = volume.dn;

            volume.addProperties({
                kind: "yaml",
                id: "config",
                title: "Config",
                order: 10,
                config: volumeConfig
            });
        }

    })
    ;
