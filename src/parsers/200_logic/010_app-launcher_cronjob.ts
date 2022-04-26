import _ from 'the-lodash';
import { CronJob } from 'kubernetes-types/batch/v1beta1';
import { K8sConfig } from '../..';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicLauncherRuntime } from '../../types/parser/logic-launcher';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';
import { OwnerReferenceDict } from '../../helpers/logic/owner-reference-dict';

export default K8sParser<CronJob>()
    .target({
        api: "batch",
        kind: "CronJob"
    })
    .handler(({ logger, scope, config, item, metadata, namespace, helpers }) => {

        helpers.k8s.labelMatcher.register(<K8sConfig>config, item);

        const root = scope.logicRootNode.fetchByNaming(NodeKind.logic);

        const ns = root.fetchByNaming(NodeKind.ns, metadata.namespace!);

        const app = ns.fetchByNaming(NodeKind.app, metadata.name);
        const appRuntime = (<LogicAppRuntime>app.runtime);
        appRuntime.namespace = namespace!;
        appRuntime.app = metadata.name!;
        appRuntime.launcherKind = config.kind!;
        appRuntime.launcherReplicas = null;
        appRuntime.volumes = {};
        appRuntime.ports = {};
        appRuntime.helmCharts = {};
        appRuntime.podTemplateSpec = config.spec?.jobTemplate.spec?.template;
        appRuntime.podOwnersDict = new OwnerReferenceDict();
        
        helpers.logic.setupHealthRuntime(appRuntime);

        item.link(LogicLinkKind.app, app);

        const launcher = helpers.shadow.create(item, app,
            {
                kind: NodeKind.launcher,
                name: config.kind,
                linkName: LogicLinkKind.k8s,
                inverseLinkName: LogicLinkKind.logic
            });

        const appLauncherRuntime = (<LogicLauncherRuntime>launcher.runtime);
        appLauncherRuntime.namespace = namespace!;
        appLauncherRuntime.app = metadata.name!;
        appLauncherRuntime.podTemplateSpec = appRuntime.podTemplateSpec;
        
        helpers.logic.setupHealthRuntime(appLauncherRuntime);

        const labelsMap = helpers.k8s.labelsMap(appRuntime.podTemplateSpec?.metadata);
        helpers.k8s.labelMatcher.registerManual('LogicApp', namespace, labelsMap, app)

        helpers.k8s.makeLabelsProps(app, config)
    })
    ;
