import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic'
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicNamespaceParser()
    .handler(({ logger, scope, item, config, runtime, helpers}) => {

        item.addProperties({
            kind: PropsKind.keyValue,
            id: PropsId.clusterConsumption,
            config: runtime.clusterConsumption
        });

    })
    ;
