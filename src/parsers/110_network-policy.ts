import _ from 'the-lodash';
import { LogicItem } from '../item';
import { ScopeParser } from '../parser-builder';

import { TableBuilder } from '../table-builder';

export default ScopeParser()
    .order(110)
    .target({
        namespaced: true,
        scopeKind: 'NetworkPolicy'
    })
    .kind('netpol')
    .handler(({ scope, itemScope, namespaceScope, createK8sItem }) => {

        let policyTypes = _.get(itemScope.config, 'spec.policyTypes');
        if (!policyTypes || policyTypes.length == 0) {
            policyTypes = ['Ingress'];
        }

        let policyProperties : Record<string, any> = {
            
        };

        var appSelector = _.get(itemScope.config, 'spec.podSelector.matchLabels');
        if (!appSelector)
        {
            appSelector = {};
        }

        var appScopes = namespaceScope!.findAppScopesByLabels(appSelector);
        for(var appScope of appScopes)
        {
            var container = appScope.item.fetchByNaming("netpols", "NetworkPolicies");

            var k8sNetworkPolicy = createK8sItem(container);
            itemScope.registerItem(k8sNetworkPolicy);
            itemScope.markUsedBy(k8sNetworkPolicy);

            processRules(k8sNetworkPolicy, 
                'Ingress',
                'spec.ingress',
                'from');
            
            processRules(k8sNetworkPolicy, 
                'Egress',
                'spec.egress',
                'to');
        }

        itemScope.addProperties(policyProperties);

        ///

        function processRules(k8sNetworkPolicy: LogicItem, policyType: string, specPath: string, rulesPath: string)
        {
            if (!_.includes(policyTypes, policyType)) {
                return;
            }

            policyProperties[policyTypes] = true;

            let trafficTable = new TableBuilder()
                .column('dn', 'Application', 'shortcut')
                .column('ports')
                .column('access');

            let cidrTrafficTable = new TableBuilder()
                .column('target')
                .column('ports')
                .column('access');

            var policyConfig = _.get(itemScope.config, specPath);
            if (policyConfig)
            {
                for(var policyItem of policyConfig)
                {
                    var portsInfo = "*";
                    if (policyItem.ports)
                    {
                        portsInfo = policyItem.ports.map((x : any) => {
                            var items = [x.port, x.name, x.protocol];
                            items = _.filter(items, x => _.isNotNullOrUndefined(x));
                            return items.join('/');
                        })
                        .join(', ');
                    }

                    let rules = _.get(policyItem, rulesPath);
                    if (rules)
                    {
                        for(var rule of rules)
                        {
                            const ipBlock = _.get(rule, 'ipBlock');
                            if (ipBlock)
                            {
                                cidrTrafficTable.row({
                                    target: _.get(ipBlock, 'cidr'),
                                    ports: portsInfo,
                                    access: 'allow'
                                })

                                const cidrExcept = _.get(ipBlock, 'except');
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
                                var podSelectorLabels = _.get(rule, 'podSelector.matchLabels');
                                if (!podSelectorLabels)
                                {
                                    podSelectorLabels = {};
                                }
    
                                let targetNamespaceScopes = [namespaceScope];
                                let namespaceSelectorLabels = _.get(rule, 'namespaceSelector.matchLabels');
                                if (namespaceSelectorLabels)
                                {
                                    targetNamespaceScopes = scope.findNamespaceScopesByLabels(namespaceSelectorLabels);
                                }
    
                                for(let targetNamespaceScope of targetNamespaceScopes)
                                {
                                    var fromAppScopes = targetNamespaceScope!.findAppScopesByLabels(podSelectorLabels);
                                    for(var fromAppScope of fromAppScopes)
                                    {
                                        trafficTable.row({
                                            dn: fromAppScope.item.dn,
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
                k8sNetworkPolicy.addProperties({
                    kind: "table",
                    id: `${policyType.toLowerCase()}-app`,
                    title: `${policyType} Application Rules`,
                    order: 8,
                    config: trafficTable.extract()
                });
            }

            if (cidrTrafficTable.hasRows) {
                k8sNetworkPolicy.addProperties({
                    kind: "table",
                    id: `${policyType.toLowerCase()}-cidr`,
                    title: `${policyType} CIDR Rules`,
                    order: 8,
                    config: cidrTrafficTable.extract()
                });
            }

            if ((trafficTable.rowCount + cidrTrafficTable.rowCount) == 0) {
                policyProperties[policyType + ' Blocked'] = true;
            }
        }

    })
    ;