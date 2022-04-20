import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { FlagKind } from '@kubevious/entity-meta';

export default LogicParser()
    .survivesBreakpoint()
    .target({
        path: [],
        subtree: true
    })
    .handler(({ logger, item, helpers }) => {

        if (item.usedDnsList.length > 1)
        {
            item.setFlag(FlagKind.shared);
        }

    })
    ;