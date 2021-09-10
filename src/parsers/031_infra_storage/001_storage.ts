import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { InfraStorageRuntime } from '../../types/parser/infra-storage'

export default LogicParser()
    .target({
        path: ["infra"]
    })
    .handler(({ logger, item, config, runtime }) => {

        const storage = item.fetchByNaming('storage');

    })
    ;
