import _ from 'the-lodash';
import { DaemonSet, Deployment, StatefulSet } from 'kubernetes-types/apps/v1';
import { Job } from 'kubernetes-types/batch/v1';
import { K8sConfig } from '../..';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicLauncherRuntime } from '../../types/parser/logic-launcher';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';
import { OwnerReferenceDict } from '../../helpers/logic/owner-reference-dict';

export default K8sParser<Deployment | DaemonSet | StatefulSet | Job>()
    .target({
        api: "apps",
        kind: "Deployment"
    })
    .target({
        api: "apps",
        kind: "DaemonSet"
    })
    .target({
        api: "apps",
        kind: "StatefulSet"
    })
    .target({
        api: "batch",
        kind: "Job"
    })
    .handler(({ logger, scope, config, item, metadata, namespace, helpers }) => {

        if (config.metadata?.ownerReferences) {
            if (config.metadata?.ownerReferences.length > 0) {
                if (config.kind === 'Job') {
                    helpers.logic.processOwnerReferences(item, NodeKind.job, metadata);
                }
                return;
            }
        }

        helpers.k8s.labelMatcher.register(<K8sConfig>config, item);

        const root = scope.logicRootNode.fetchByNaming(NodeKind.logic);

        const ns = root.fetchByNaming(NodeKind.ns, metadata.namespace!);

        const app = ns.fetchByNaming(NodeKind.app, metadata.name);
        const appRuntime = (<LogicAppRuntime>app.runtime);

        appRuntime.namespace = namespace!;
        appRuntime.app = metadata.name!;
        appRuntime.launcherKind = config.kind!;
        appRuntime.launcherReplicas = _.get(config, 'spec.replicas') ?? null;
        appRuntime.volumes = {};
        appRuntime.ports = {};
        appRuntime.helmCharts = {};
        appRuntime.podTemplateSpec = config.spec?.template;
        appRuntime.podReferenceDict = new OwnerReferenceDict();

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
