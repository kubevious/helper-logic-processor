import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic'
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicAppParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        item.addProperties({
            kind: PropsKind.keyValue,
            id: PropsId.resourcesPerPod,
            config: runtime.perPodResources
        });

    })
    ;
