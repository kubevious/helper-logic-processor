import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { FlagKind } from '@kubevious/entity-meta';

export default LogicParser()
    .target({
        path: [],
        subtree: true
    })
    .handler(({ logger, item, helpers }) => {

        const usedDnsMap = item.usedDns;
        const dns = _.keys(usedDnsMap)

        if (dns.length > 1)
        {
            item.setFlag(FlagKind.shared);
        }

    })
    ;