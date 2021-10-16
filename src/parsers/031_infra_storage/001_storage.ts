import _ from 'the-lodash';
import { NodeKind } from '@kubevious/entity-meta';
import { InfraParser } from '../../parser-builder/infra';

export default InfraParser()
    .handler(({ logger, item, config, runtime }) => {

        const storage = item.fetchByNaming(NodeKind.storage);

    })
    ;
