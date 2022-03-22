import _ from 'the-lodash';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicContainerParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

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

                const mounts = item.fetchByNaming(NodeKind.mounts);

                const containerVolumeMount = mounts.fetchByNaming(NodeKind.mount, volumeMountConfig.mountPath);
                containerVolumeMount.link(LogicLinkKind.volume, volume);
                volume.link(LogicLinkKind.mount, containerVolumeMount, `${item.naming}-${containerVolumeMount.naming}`);

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
                    const mountChild = helpers.shadow.create(volumeChild, containerVolumeMount, 
                        {
                            linkName: LogicLinkKind.volume,
                            inverseLinkName: LogicLinkKind.mount,
                            inverseLinkPath: `${item.naming}-${containerVolumeMount.naming}`
                        })

                    for(const k8sChild of volumeChild.resolveTargetLinkItems(LogicLinkKind.k8s))
                    {
                        mountChild.link(LogicLinkKind.k8s, k8sChild);
                    }
                }
            }
        }

    })
    ;
