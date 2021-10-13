import _ from 'the-lodash';
import { LogicVolumeParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicVolumeParser()
    .handler(({ logger, item, config, helpers, runtime }) => {

        if (!config.secret) {
            return;
        }

        if (config.secret.secretName) {
            findAndProcessSecret(config.secret.secretName, config.secret.optional)
        }

        /*** HELPERS **/

        function findAndProcessSecret(name: string, isOptional?: boolean) 
        {
            let logicSecret = item.fetchByNaming(NodeKind.secret, name);
        }


    })
    ;
