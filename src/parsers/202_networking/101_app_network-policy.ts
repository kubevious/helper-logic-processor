import { NetworkPolicy } from 'kubernetes-types/networking/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';

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

        for(let targetApp of targetApps)
        {
            const container = targetApp.fetchByNaming('netpols', 'NetworkPolicies')

            const logicNetworkPolicy = container.fetchByNaming('netpol', metadata.name)
            logicNetworkPolicy.makeShadowOf(item);
            logicNetworkPolicy.link('k8s-owner', item);
        }
        
    })
    ;
