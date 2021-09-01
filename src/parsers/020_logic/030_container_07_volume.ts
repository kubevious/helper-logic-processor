import { Container } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { LogicAppRuntime } from '../../types/parser/logic-app';

export default LogicParser<Container>()
    .target({
        path: ["logic", "ns", "app", "cont"]
    })
    .target({
        path: ["logic", "ns", "app", "initcont"]
    })
    .handler(({ logger, scope, item, config, helpers}) => {

        if (!config.volumeMounts) {
            return;
        }

        const app = item.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;

        for(let volumeMount of config.volumeMounts)
        {
            const volumeDn = appRuntime.volumes[volumeMount.name];
            if (volumeDn)
            {
                const volume = scope.findItem(volumeDn)!;

                let logicConfigMap = item.fetchByNaming("vol", volume.naming);
                // Either make shadow, or clone stuff manually.
                // but props will be different. so maybe clone manully better.
                // logicConfigMap.makeShadowOf(volume);
                // TODO: 
            }
        }

    })
    ;
