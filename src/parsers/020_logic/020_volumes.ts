import _ from 'the-lodash';
import { Volume } from 'kubernetes-types/core/v1'
import { DaemonSet, Deployment, StatefulSet } from 'kubernetes-types/apps/v1';
import { Job } from 'kubernetes-types/batch/v1';

import { LogicParser } from '../../parser-builder';

export default LogicParser<Deployment | DaemonSet | StatefulSet | Job>()
    .trace()
    .target({
        path: ["logic", "ns", "app", "launcher"]
    })
    .handler(({ logger, item, config}) => {

        if (!config.spec) {
            return;
        }
        if (! config.spec.template.spec) {
            return;
        }

        const volumesList = config.spec.template.spec.volumes;
        if (!volumesList || volumesList.length == 0) {
            return;
        }

        const app = item.parent!;
        const volumesParent = app.fetchByNaming("vol", "Volumes");


        for(let volume of volumesList)
        {
            processVolume(volume);
        }

        /** HELPERS **/

        function processVolume(volumeConfig: Volume)
        {
            const volume = volumesParent.fetchByNaming('vol', volumeConfig.name);
            volume.setConfig(volumeConfig);

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
