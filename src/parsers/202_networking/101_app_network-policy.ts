import { NetworkPolicy } from 'kubernetes-types/networking/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';

export default K8sParser<NetworkPolicy>()
    .target({
        api: "networking.k8s.io",
        kind: "NetworkPolicy"
    })
    .handler(({ logger, config, item, metadata, namespace, helpers }) => {

        if (!config.spec) {
            return;
        }

        let policyTypes = config.spec?.policyTypes ?? [];
        if (policyTypes.length == 0) {
            policyTypes = [ 'Ingress' ];
        }

        const targetApps = helpers.k8s.labelMatcher.matchSelector(
            'LogicApp',
            namespace,
            config.spec.podSelector);

        for(const targetApp of targetApps)
        {
            const container = targetApp.fetchByNaming(NodeKind.netpols)

            helpers.shadow.create(item, container,
                {
                    kind: NodeKind.netpol,
                    linkName: 'k8s-owner'
                });
        }
        
    })
    ;
