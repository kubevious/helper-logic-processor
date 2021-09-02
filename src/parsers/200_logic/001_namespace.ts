import { Namespace } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { LogicNamespaceRuntime } from '../../types/parser/logic-namespace';

export default K8sParser<Namespace>()
    .target({
        clustered: true,
        kind: "Namespace"
    })
    .handler(({ logger, scope, config, item, metadata, namespace, helpers }) => {

        const root = scope.logicRootNode.fetchByNaming('logic', '');

        const ns = root.fetchByNaming('ns', metadata.name!);
        ns.makeShadowOf(item);

        (<LogicNamespaceRuntime>ns.runtime).namespace = metadata.name!;

        let labelsMap = helpers.k8s.labelsMap(metadata);
        helpers.k8s.labelMatcher.registerManual('Namespace', namespace, labelsMap, ns)

    })
    ;
