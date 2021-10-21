import _ from 'the-lodash';
import { LogicNetworkPoliciesParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicNetworkPoliciesParser()
    .handler(({ logger, item, helpers }) => {

        const properties = item.buildProperties();

        for(const direction of helpers.networking.directions)
        {
            processDirection(direction);
        }

        properties.build();

        /*** HELPERS ***/

        function processDirection(direction: string)
        {
            properties.add(direction, false);

            const trafficTable = helpers.common.tableBuilder()
                .column('dn', 'Application', 'shortcut')
                .column('ports')
                .column('access')
                .column('policy', 'Policy', 'shortcut')
                ;

            const cidrTrafficTable = helpers.common.tableBuilder()
                .column('target')
                .column('ports')
                .column('access')
                .column('policy', 'Policy', 'shortcut')
                ;

            for(const child of item.getChildrenByKind(NodeKind.netpol))
            {
                const childProperties = child.getProperties('properties');
                if (childProperties)
                {
                    if (childProperties.config[direction])
                    {
                        properties.add(direction, true);
                    }
                }

                const childTrafficTable = child.getProperties(`${direction.toLowerCase()}-app`);
                if (childTrafficTable)
                {
                    for(const row of childTrafficTable.config.rows)
                    {
                        const myRule = _.clone(row);
                        myRule.policy = child.id;
                        trafficTable.row(myRule);
                    }
                }

                const childCidrTrafficTable = child.getProperties(`${direction.toLowerCase()}-cidr`);
                if (childCidrTrafficTable)
                {
                    for(const row of childCidrTrafficTable.config.rows)
                    {
                        const myRule = _.clone(row);
                        myRule.policy = child.id;
                        cidrTrafficTable.row(myRule);
                    }
                }
            }

            if (trafficTable.hasRows) {
                item.addProperties({
                    kind: PropsKind.table,
                    id: (direction === helpers.networking.directionIngress) ? PropsId.ingressApp : PropsId.egressApp,
                    title: `${direction} Application Rules`,
                    order: 8,
                    config: trafficTable.extract()
                });
            }

            if (cidrTrafficTable.hasRows) {
                item.addProperties({
                    kind: PropsKind.table,
                    id: (direction === helpers.networking.directionIngress) ? PropsId.ingressCidr : PropsId.egressCidr,
                    title: `${direction} CIDR Rules`,
                    order: 8,
                    config: cidrTrafficTable.extract()
                });
            }

            if (properties.get(direction))
            {
                if ((trafficTable.rowCount + cidrTrafficTable.rowCount) == 0) {
                    properties.add(`${direction} Blocked`, true);
                }
            }

        }
        
    })
    ;
