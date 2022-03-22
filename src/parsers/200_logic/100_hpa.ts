import _ from 'the-lodash';
import { HorizontalPodAutoscaler } from 'kubernetes-types/autoscaling/v1';
import { K8sParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

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
        const k8sTarget = item.link(LogicLinkKind.target, k8sTargetDn);

        if (!k8sTarget) {
            item.raiseAlert(ValidatorID.MISSING_HPA_APP, 'Could not find apps matching scaleTargetRef.');
            return;
        }

        const app = k8sTarget.resolveTargetLinkItem(LogicLinkKind.app);
        if (!app) {
            // TODO: SHould not happen, but trigger alert;
            return;
        }

        const appRuntime = <LogicAppRuntime>app.runtime;

        helpers.shadow.create(item, app, 
            {
                kind: NodeKind.hpa,
                linkName: LogicLinkKind.k8s,
                inverseLinkName: LogicLinkKind.logic,
                inverseLinkPath: `${appRuntime.namespace}::${app.naming}`
            })

        item.link(LogicLinkKind.app, app, app.naming);

        appRuntime.hpa = { 
            min: config.spec.minReplicas ?? 1,
            max: config.spec.maxReplicas
        };

    })
    ;
