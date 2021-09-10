import _ from 'the-lodash';
import { LogicNetworkPoliciesParser } from '../../parser-builder/logic';

export default LogicNetworkPoliciesParser()
    .handler(({ logger, item, helpers }) => {

        let properties = item.buildProperties();

        for(let direction of ['Ingress', 'Egress'])
        {
            processDirection(direction);
        }

        properties.build();

        /*** HELPERS ***/

        function processDirection(direction: string)
        {
            properties.add(direction, false);

            let trafficTable = helpers.common.tableBuilder()
                .column('dn', 'Application', 'shortcut')
                .column('ports')
                .column('access')
                .column('policy', 'Policy', 'shortcut')
                ;

            let cidrTrafficTable = helpers.common.tableBuilder()
                .column('target')
                .column('ports')
                .column('access')
                .column('policy', 'Policy', 'shortcut')
                ;

            for(let child of item.getChildrenByKind('netpol'))
            {
                let childProperties = child.getProperties('properties');
                if (childProperties)
                {
                    if (childProperties.config[direction])
                    {
                        properties.add(direction, true);
                    }
                }

                let childTrafficTable = child.getProperties(`${direction.toLowerCase()}-app`);
                if (childTrafficTable)
                {
                    for(let row of childTrafficTable.config.rows)
                    {
                        let myRule = _.clone(row);
                        myRule.policy = child.id;
                        trafficTable.row(myRule);
                    }
                }

                let childCidrTrafficTable = child.getProperties(`${direction.toLowerCase()}-cidr`);
                if (childCidrTrafficTable)
                {
                    for(let row of childCidrTrafficTable.config.rows)
                    {
                        let myRule = _.clone(row);
                        myRule.policy = child.id;
                        cidrTrafficTable.row(myRule);
                    }
                }
            }

            if (trafficTable.hasRows) {
                item.addProperties({
                    kind: "table",
                    id: `${direction.toLowerCase()}-app`,
                    title: `${direction} Application Rules`,
                    order: 8,
                    config: trafficTable.extract()
                });
            }

            if (cidrTrafficTable.hasRows) {
                item.addProperties({
                    kind: "table",
                    id: `${direction.toLowerCase()}-cidr`,
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
