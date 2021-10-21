import { DaemonSet, Deployment, StatefulSet } from 'kubernetes-types/apps/v1';
import { Job } from 'kubernetes-types/batch/v1';
import _ from 'the-lodash';
import { K8sConfig } from '../..';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicLauncherRuntime } from '../../types/parser/logic-launcher';
import { NodeKind } from '@kubevious/entity-meta';

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

        helpers.k8s.labelMatcher.register(<K8sConfig>config, item);

        const root = scope.logicRootNode.fetchByNaming(NodeKind.logic);

        const ns = root.fetchByNaming(NodeKind.ns, metadata.namespace!);

        const app = ns.fetchByNaming(NodeKind.app, metadata.name);
        (<LogicAppRuntime>app.runtime).namespace = namespace!;
        (<LogicAppRuntime>app.runtime).launcherKind = config.kind!;
        (<LogicAppRuntime>app.runtime).launcherReplicas = _.get(config, 'spec.replicas') ?? null;
        (<LogicAppRuntime>app.runtime).volumes = {};
        (<LogicAppRuntime>app.runtime).ports = {};
        (<LogicAppRuntime>app.runtime).helmCharts = {};
        item.link('app', app);

        const launcher = helpers.shadow.create(item, app,
            {
                kind: NodeKind.launcher,
                linkName: 'k8s-owner',
                inverseLinkName: 'logic'
            });

        (<LogicLauncherRuntime>launcher.runtime).namespace = namespace!;

        const labelsMap = helpers.k8s.labelsMap(config.spec?.template.metadata);
        helpers.k8s.labelMatcher.registerManual('LogicApp', namespace, labelsMap, app)

        helpers.k8s.makeLabelsProps(app, config)
    })
    ;
