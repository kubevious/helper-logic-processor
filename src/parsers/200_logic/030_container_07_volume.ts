import _ from 'the-lodash';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
    .handler(({ logger, scope, item, config, helpers}) => {

        if (!config.volumeMounts) {
            return;
        }

        const app = item.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;

        for(let volumeMountConfig of config.volumeMounts)
        {
            const volumeDn = appRuntime.volumes[volumeMountConfig.name];
            if (volumeDn)
            {
                const volume = scope.findItem(volumeDn)!;

                let containerVolumeMount = item.fetchByNaming("vol", volume.naming);
                containerVolumeMount.link('volume', volume);

                containerVolumeMount.addProperties({
                    kind: "yaml",
                    id: "env",
                    title: "Mount Config",
                    order: 5,
                    config: volumeMountConfig
                });  

                {
                    containerVolumeMount.addProperties(volume.getProperties('config')!);
                }

                for(let volumeChild of volume.getChildren())
                {
                    const containerVolumeChild = containerVolumeMount.fetchByNaming(volumeChild.kind, volumeChild.naming);
                    containerVolumeChild.makeShadowOf(volumeChild);
                }
            }
        }

    })
    ;
