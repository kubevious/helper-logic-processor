import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';

export default LogicParser()
    .target({
        path: ["infra"]
    })
    .handler(({ logger, item, config, runtime }) => {

        const storage = item.fetchByNaming('storage');

    })
    ;
