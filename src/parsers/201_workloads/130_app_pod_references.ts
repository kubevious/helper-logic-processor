import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic';
import { LogicItem } from '../../logic/item';
import { Pod } from 'kubernetes-types/core/v1';
import { PropsId, PropsKind } from '@kubevious/entity-meta';
import { PodVersionsHealthInfo, PodVersionHealthInfo } from '@kubevious/entity-meta/dist/props-config/pods-versions-health';
import { LogicPodRuntime } from '../../types/parser/logic-pod';

export default LogicAppParser()
    .handler(({ logger, scope, item, runtime, config, helpers }) => {

        const appInstancesDict : Record<string, PodVersionHealthInfo> = {};

        for(const ownerInfo of runtime.podOwnersDict.getItems())
        {
            for(const logicPodItem of ownerInfo.items)
            {
                const podRuntime = logicPodItem.runtime as LogicPodRuntime;
                const podConfig = logicPodItem.config as Pod;
                const appVersionInstance = getAppInstanceVersionInfo(logicPodItem);
                appVersionInstance.pods.push({
                    dn: logicPodItem.dn,
                    date: podConfig?.metadata?.creationTimestamp ?? '',
                    phase: podRuntime.phase,
                    runStage: podRuntime.runStage,
                    conditions: podRuntime.conditions,
                });
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

        item.addProperties({
            kind: PropsKind.podsVersionsHealth,
            id: PropsId.podStages,
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