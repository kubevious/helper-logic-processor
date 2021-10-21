import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';

export default LogicParser()
    .target({
        path: [],
        subtree: true
    })
    .handler(({ logger, item, helpers }) => {

        {

            const usedDnsMap = item.usedDns;
            const usedDns = _.orderBy(_.keys(usedDnsMap));

            if (usedDns.length > 0) {
               
                item.addProperties({
                    kind: "dn-list",
                    id: 'uses-dns',
                    title: 'Uses Dns',
                    order: 9,
                    config: usedDns
                });

            }
        }

    })
    ;