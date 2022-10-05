import { NodeKind } from '@kubevious/entity-meta/dist';
import _ from 'the-lodash';
import { OwnerReferenceDict } from '../../helpers/logic/owner-reference-dict';
import { LogicLinkKind } from '../../logic/link-kind';
import { LogicAppParser } from '../../parser-builder/logic';
import { K8sConfig } from '../../types/k8s';
import { LogicLauncherRuntime } from '../../types/parser/logic-launcher';


export default LogicAppParser()
    .handler(({ scope, logger, helpers, item, runtime}) => {

        for(const launcherInfo of runtime.sourceLauncherInfos)
        {
            const launcherK8sItem = scope.findItem(launcherInfo.dn)!;
            const launcherConfig = launcherK8sItem.config as K8sConfig;
            
            const launcherLogicItem = helpers.shadow.create(launcherK8sItem, item,
                {
                    kind: launcherInfo.nodeKind,
                    name: launcherConfig.metadata.name!,
                    linkName: LogicLinkKind.k8s,
                    inverseLinkName: LogicLinkKind.logic
                });

            item.link(LogicLinkKind.launcher, launcherLogicItem);
    
            const appLauncherRuntime = (<LogicLauncherRuntime>launcherLogicItem.runtime);
            appLauncherRuntime.namespace = runtime.namespace;
            appLauncherRuntime.app = runtime.app;

            appLauncherRuntime.podTemplateSpec = launcherInfo.podTemplateSpec;
    
            helpers.logic.health.setupHealthRuntime(appLauncherRuntime);
        }

    })
    ;
