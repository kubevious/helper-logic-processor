import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicParser()
    .survivesBreakpoint()
    .skip() // TODO: This parser should not be present in production.
    .target({
        path: [],
        subtree: true
    })
    .handler(({ logger, item, helpers }) => {

        const dns = item.usedDnsList;

        if (dns.length > 0) {
            const usedDns = _.orderBy(dns);

            item.addProperties({
                kind: PropsKind.dnList,
                id: PropsId.usedBy,
                config: usedDns
            }, {
                isSelfProps: true
            });
        }

    })
    ;