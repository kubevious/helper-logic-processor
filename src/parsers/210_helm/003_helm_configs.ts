import _ from 'the-lodash';
import { PackHelmVersionParser } from '../../parser-builder/pack';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default PackHelmVersionParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        let dns = _.keys(runtime.configs);
        dns = _.orderBy(dns);

        item.addProperties({
            kind: PropsKind.dnList,
            id: PropsId.contents,
            title: 'Contents',
            order: 8,
            config: dns
        });

    })
    ;
