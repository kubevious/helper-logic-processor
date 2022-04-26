import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicCommonWorkload } from '../../types/parser/logic-common';

export default LogicAppParser()
    .trace()
    .handler(({ logger, scope, item, runtime, config, helpers }) => {

        for(const group of runtime.podReferenceDict.getItems())
        {
            logger.info(">>>> %s ", group.ref.name);

            for(const x of group.items.map(x => x.dn))
            {
                logger.info("      - %s ", x);
            }
        }
        
       

    })
    ;