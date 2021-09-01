import _ from 'the-lodash';
import { ConfigMap, Volume } from 'kubernetes-types/core/v1'

import { LogicParser } from '../../parser-builder';
import { LogicVolumeRuntime } from '../../types/parser/logic-volume';

export default LogicParser<Volume, LogicVolumeRuntime>()
    .target({
        path: ["logic", "ns", "app", "vols", "vol"]
    })
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
            let logicSecret = item.fetchByNaming("secret", name);
        }


    })
    ;
