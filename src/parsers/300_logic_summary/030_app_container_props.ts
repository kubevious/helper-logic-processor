import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
    .handler(({ logger, scope, item, runtime }) => {

        const builder = item.buildProperties();

        builder.add('Volumes', item.countItemsByPath({ path: ["vol"] }));
        builder.add('ConfigMap Volumes', item.countItemsByPath({ path: ["vol", "configmap"] }));
        builder.add('Secret Volumes', item.countItemsByPath({ path: ["vol", "secret"] }));

        builder.build();
    })
    ;