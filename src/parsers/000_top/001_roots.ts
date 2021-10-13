import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';

import { TOP_ROOTS, parseDn } from '@kubevious/entity-meta'

export default LogicParser()
    .target({
        path: []
    })
    .handler(({ item }) => {

        for(const x of TOP_ROOTS)
        {
            const parts = parseDn(x.dn);
            item.fetchByNaming(_.last(parts)!.kind);
        }

    })
    ;
