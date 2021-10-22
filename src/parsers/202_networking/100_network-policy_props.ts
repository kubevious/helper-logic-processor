import { NetworkPolicy, NetworkPolicyEgressRule, NetworkPolicyIngressRule, NetworkPolicyPeer } from 'kubernetes-types/networking/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { LogicNamespaceRuntime } from '../../types/parser/logic-namespace';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default K8sParser<NetworkPolicy>()
    .target({
        api: "networking.k8s.io",
        kind: "NetworkPolicy"
    })
    .handler(({ logger, config, item, namespace, helpers }) => {

        if (!config.spec) {
            return;
        }

        let policyTypes = config.spec?.policyTypes ?? [];
        if (policyTypes.length == 0) {
            policyTypes = [ 'Ingress' ];
        }

        const propsBuilder = item.buildProperties();

        processRules( 
            helpers.networking.directionIngress,
            config.spec.ingress,
            (x) => x.from);
        
        processRules( 
            helpers.networking.directionEgress,
            config.spec.egress,
            (x) => x.to);

        propsBuilder.build();

        /*** HELPERS ***/

        function processRules<TRule extends NetworkPolicyIngressRule | NetworkPolicyEgressRule>(
            policyType: string,
            policyConfig: TRule[] | undefined,
            peersFetchCb: (rule: TRule) => NetworkPolicyPeer[] | undefined)
        {
            if (!_.includes(policyTypes, policyType)) {
                return;
            }

            propsBuilder.add(policyType, true);

            const trafficTable = helpers.common.tableBuilder()
                .column('dn', 'Application', 'shortcut')
                .column('ports')
                .column('access');

            const cidrTrafficTable = helpers.common.tableBuilder()
                .column('target')
                .column('ports')
                .column('access');

            if (policyConfig)
            {
                for(const policyItem of policyConfig)
                {
                    let portsInfo = "*";
                    if (policyItem.ports)
                    {
                        portsInfo = policyItem.ports.map((x : any) => {
                            let items = [x.port, x.name, x.protocol];
                            items = _.filter(items, x => _.isNotNullOrUndefined(x));
                            return items.join('/');
                        })
                        .join(', ');
                    }

                    const rules = peersFetchCb(policyItem);
                    if (rules)
                    {
                        for(const rule of rules)
                        {
                            const ipBlock = rule.ipBlock;
                            if (ipBlock)
                            {
                                cidrTrafficTable.row({
                                    target: ipBlock.cidr,
                                    ports: portsInfo,
                                    access: 'allow'
                                })

                                const cidrExcept = ipBlock.except;
                                if (cidrExcept)
                                {
                                    for(const ip of cidrExcept)
                                    {
                                        cidrTrafficTable.row({
                                            target: ip,
                                            ports: portsInfo,
                                            access: 'deny'
                                        })
                                    }
                                }
                            }
                            else
                            {
                                let podSelectorLabels = rule.podSelector;
                                if (!podSelectorLabels)
                                {
                                    podSelectorLabels = {};
                                }
    
                                let targetNamespaces = [namespace!];
                                const namespaceSelector = rule.namespaceSelector;
                                if (namespaceSelector)
                                {
                                    targetNamespaces = [];

                                    const targetNamespaceItems = helpers.k8s.labelMatcher.matchSelector('Namespace', null, namespaceSelector);
                                    for(const x of targetNamespaceItems)
                                    {
                                        const targetNsName = (<LogicNamespaceRuntime>x.runtime).namespace;
                                        targetNamespaces.push(targetNsName);
                                    }
                                }
    
                                for(const targetNamespace of targetNamespaces)
                                {
                                    const targetApps = helpers.k8s.labelMatcher.matchSelector(
                                        'LogicApp',
                                        targetNamespace,
                                        podSelectorLabels);

                                    for(const targetApp of targetApps)
                                    {
                                        trafficTable.row({
                                            dn: targetApp.dn,
                                            ports: portsInfo,
                                            access: 'allow'
                                        })
                                    }
                                }
                            }

                        }
                    }
                }
            }

            if (trafficTable.hasRows) {
                item.addProperties({
                    kind: PropsKind.table,
                    id: (policyType === helpers.networking.directionIngress) ? PropsId.ingressApp : PropsId.egressApp,
                    config: trafficTable.extract()
                });
            }

            if (cidrTrafficTable.hasRows) {
                item.addProperties({
                    kind: PropsKind.table,
                    id: (policyType === helpers.networking.directionIngress) ? PropsId.ingressCidr : PropsId.egressCidr,
                    config: cidrTrafficTable.extract()
                });
            }

            if ((trafficTable.rowCount + cidrTrafficTable.rowCount) == 0) {
                propsBuilder.add(`${policyType} Blocked`, true);
            }
        }
        
    })
    ;
