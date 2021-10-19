import _ from 'the-lodash';
import { PackHelmVersionParser } from '../../parser-builder/pack';

export default PackHelmVersionParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        let dns = _.keys(runtime.configs);
        dns = _.orderBy(dns);

        item.addProperties({
            kind: "dn-list",
            id: 'contents',
            title: 'Contents',
            order: 8,
            config: dns
        });

    })
    ;
