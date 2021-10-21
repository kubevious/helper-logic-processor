import _ from 'the-lodash';
import { HorizontalPodAutoscaler } from 'kubernetes-types/autoscaling/v1';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';

export default K8sParser<HorizontalPodAutoscaler>()
    .target({
        api: "autoscaling",
        kind: "HorizontalPodAutoscaler"
    })
    .handler(({ logger, scope, config, item, metadata, namespace, helpers }) => {

        if (!config.spec) {
            return;
        }

        const targetRef = config.spec.scaleTargetRef;

        const apiVersion = targetRef.apiVersion ?? 'apps/v1';

        const k8sTargetDn = helpers.k8s.makeDn(namespace!, apiVersion, targetRef.kind, targetRef.name);
        const k8sTarget = item.link('target', k8sTargetDn);

        if (!k8sTarget) {
            item.addAlert('MissingApp', 'error', 'Could not find apps matching scaleTargetRef.');
            return;
        }

        const app = k8sTarget.resolveTargetLinkItem('app');
        if (!app) {
            // TODO: SHould not happen, but trigger alert;
            return;
        }

        helpers.shadow.create(item, app, 
            {
                kind: NodeKind.hpa,
                linkName: 'k8s-owner'
            })

        const appRuntime = <LogicAppRuntime>app.runtime;
        appRuntime.hpa = { 
            min: config.spec.minReplicas ?? 1,
            max: config.spec.maxReplicas
        };

    })
    ;
