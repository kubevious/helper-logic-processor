import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicParser()
    .target({
        path: ["infra"]
    })
    .handler(({ logger, item, config, runtime }) => {

        const storage = item.fetchByNaming(NodeKind.storage);

    })
    ;
