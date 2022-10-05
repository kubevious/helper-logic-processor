import _ from 'the-lodash';
import { OwnerReferenceDict } from '../../helpers/logic/owner-reference-dict';
import { LogicLinkKind } from '../../logic/link-kind';
import { LogicAppParser } from '../../parser-builder/logic';
import { K8sConfig } from '../../types/k8s';


export default LogicAppParser()
    .handler(({ scope, logger, helpers, item, runtime}) => {

        // logger.info("****** APP ROOT: %s", item.dn);

        runtime.volumes = {};
        runtime.ports = {};
        runtime.helmCharts = {};
        runtime.podOwnersDict = new OwnerReferenceDict();

        for(const launcherInfo of runtime.sourceLauncherInfos) {
            const launcherItem = scope.findItem(launcherInfo.dn)!;
            const launcherConfig = launcherItem.config as K8sConfig;
            helpers.k8s.labelMatcher.register(launcherConfig, launcherItem);
            launcherItem.link(LogicLinkKind.app, item);

            helpers.k8s.makeLabelsProps(item, launcherConfig)
        }

        const labelsMap = helpers.k8s.labelsMap(runtime.podTemplateSpec?.metadata);
        helpers.k8s.labelMatcher.registerManual('LogicApp', runtime.namespace, labelsMap, item);

        helpers.logic.health.setupHealthRuntime(runtime);
    })
    ;
