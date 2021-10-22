import _ from 'the-lodash';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicContainerParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicContainerParser()
    .handler(({ logger, scope, item, config, helpers}) => {

        if (!config.volumeMounts) {
            return;
        }

        const app = item.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;

        for(const volumeMountConfig of config.volumeMounts)
        {
            const volumeDn = appRuntime.volumes[volumeMountConfig.name];
            if (volumeDn)
            {
                const volume = scope.findItem(volumeDn)!;

                const containerVolumeMount = item.fetchByNaming(NodeKind.vol, volume.naming);
                containerVolumeMount.link('volume', volume);

                containerVolumeMount.addProperties({
                    kind: PropsKind.yaml,
                    id: PropsId.mount,
                    config: volumeMountConfig
                });  

                {
                    containerVolumeMount.addProperties(volume.getProperties('config')!);
                }

                for(const volumeChild of volume.getChildren())
                {
                    helpers.shadow.create(volumeChild, containerVolumeMount, 
                        {
                            linkName: 'mount'
                        })
                }
            }
        }

    })
    ;
