import { Namespace } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { LogicNamespaceRuntime } from '../../types/parser/logic-namespace';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default K8sParser<Namespace>()
    .target({
        clustered: true,
        kind: "Namespace"
    })
    .handler(({ logger, scope, config, item, metadata, namespace, helpers }) => {

        const root = scope.logicRootNode.fetchByNaming(NodeKind.logic);

        const ns = helpers.shadow.create(item, root,
            {
                kind: NodeKind.ns,
                linkName: LogicLinkKind.k8s,
                inverseLinkName: LogicLinkKind.logic
            });

        (<LogicNamespaceRuntime>ns.runtime).namespace = metadata.name!;

        const labelsMap = helpers.k8s.labelsMap(metadata);
        helpers.k8s.labelMatcher.registerManual('Namespace', namespace, labelsMap, ns)

    })
    ;
