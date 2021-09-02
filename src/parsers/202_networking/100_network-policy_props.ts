import { NetworkPolicy, NetworkPolicyEgressRule, NetworkPolicyIngressRule, NetworkPolicyPeer } from 'kubernetes-types/networking/v1';
import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { TableBuilder } from '../../table-builder';
import { LogicNamespaceRuntime } from '../../types/parser/logic-namespace';

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
            'Ingress',
            config.spec.ingress,
            (x) => x.from);
        
        processRules( 
            'Egress',
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

            let trafficTable = new TableBuilder()
                .column('dn', 'Application', 'shortcut')
                .column('ports')
                .column('access');

            let cidrTrafficTable = new TableBuilder()
                .column('target')
                .column('ports')
                .column('access');

            if (policyConfig)
            {
                for(let policyItem of policyConfig)
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

                    let rules = peersFetchCb(policyItem);
                    if (rules)
                    {
                        for(let rule of rules)
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
                                    for(let ip of cidrExcept)
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
                                let namespaceSelector = rule.namespaceSelector;
                                if (namespaceSelector)
                                {
                                    targetNamespaces = [];

                                    const targetNamespaceItems = helpers.k8s.labelMatcher.matchSelector('Namespace', null, namespaceSelector);
                                    for(let x of targetNamespaceItems)
                                    {
                                        const targetNsName = (<LogicNamespaceRuntime>x.runtime).namespace;
                                        targetNamespaces.push(targetNsName);
                                    }
                                }
    
                                for(let targetNamespace of targetNamespaces)
                                {
                                    const targetApps = helpers.k8s.labelMatcher.matchSelector(
                                        'LogicApp',
                                        targetNamespace,
                                        podSelectorLabels);

                                    for(let targetApp of targetApps)
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
                    kind: "table",
                    id: `${policyType.toLowerCase()}-app`,
                    title: `${policyType} Application Rules`,
                    order: 8,
                    config: trafficTable.extract()
                });
            }

            if (cidrTrafficTable.hasRows) {
                item.addProperties({
                    kind: "table",
                    id: `${policyType.toLowerCase()}-cidr`,
                    title: `${policyType} CIDR Rules`,
                    order: 8,
                    config: cidrTrafficTable.extract()
                });
            }

            if ((trafficTable.rowCount + cidrTrafficTable.rowCount) == 0) {
                propsBuilder.add(`${policyType} Blocked`, true);
            }
        }
        
    })
    ;
