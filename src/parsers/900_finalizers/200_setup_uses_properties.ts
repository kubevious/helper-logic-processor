import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';

export default LogicParser()
    .target({
        path: [],
        subtree: true
    })
    .handler(({ logger, item, helpers }) => {

        const usedDnsMap = item.usedDns;
        const dns = _.keys(usedDnsMap).filter(x => x != item.dn);

        if (dns.length > 0) {
            const usedDns = _.orderBy(dns);

            item.addProperties({
                kind: "dn-list",
                id: 'used-by',
                title: 'Used By',
                order: 9,
                config: usedDns
            }, {
                isSelfProps: true
            });
        }

    })
    ;