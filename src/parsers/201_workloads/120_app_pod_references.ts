import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic';
import { LogicItem } from '../../logic/item';
import { Pod } from 'kubernetes-types/core/v1';
import { PropsId, PropsKind } from '@kubevious/entity-meta';
import { PodVersionsHealthInfo, PodVersionHealthInfo } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';

export default LogicAppParser()
    .trace()
    .handler(({ logger, scope, item, runtime, config, helpers }) => {

        const appInstancesDict : Record<string, PodVersionHealthInfo> = {};

        for(const ownerInfo of runtime.podOwnersDict.getItems())
        {

            for(const logicPodItem of ownerInfo.items)
            {
                const podConfig = logicPodItem.config as Pod;
                const appVersionInstance = getAppInstanceVersionInfo(logicPodItem);
                appVersionInstance.pods.push({
                    dn: logicPodItem.dn,
                    date: podConfig?.metadata?.creationTimestamp ?? '',
                    phase: podConfig?.status?.phase ?? 'Unknown',
                })
            }
        }

        for(const versionInfo of _.values(appInstancesDict))
        {
            versionInfo.pods =
                _.chain(versionInfo.pods)
                .orderBy(x => x.date, 'asc')
                .value();
        }

        const appInstances : PodVersionsHealthInfo = {
            versions: _.chain(appInstancesDict)
                       .values()
                       .orderBy(x => x.launcher.date, 'desc')
                       .value()
        };

        logger.info("CONFIG: ", appInstances)

        item.addProperties({
            kind: PropsKind.podsVersionsHealth,
            id: PropsId.podsVersionsHealth,
            config: appInstances
        });
        
        /******/
        
        function getAppInstanceVersionInfo(logicPodItem: LogicItem)
        {
            const logicPodParent = logicPodItem.parent!;
            let appVersionInstance = appInstancesDict[logicPodParent.dn];
            if (!appVersionInstance) {
                appVersionInstance = {
                    launcher: {
                        dn: logicPodParent.dn,
                        title: logicPodParent.naming,
                        date: logicPodParent.config?.metadata?.creationTimestamp ?? ''
                    },
                    pods: []
                }
                appInstancesDict[logicPodParent.dn] = appVersionInstance;
            }
            return appVersionInstance;
        }

    })
    ;