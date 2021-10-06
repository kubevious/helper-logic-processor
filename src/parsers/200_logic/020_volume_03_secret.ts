import _ from 'the-lodash';
import { LogicVolumeParser } from '../../parser-builder/logic';

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
            let logicSecret = item.fetchByNaming("secret", name);
        }


    })
    ;
