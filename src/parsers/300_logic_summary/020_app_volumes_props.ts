import _ from 'the-lodash';
import { LogicVolumesParser } from '../../parser-builder/logic';
import { LogicAppRuntime } from '../../types/parser/logic-app';

export default LogicVolumesParser()
    .handler(({ logger, scope, item, runtime }) => {

        const app = item.parent!;
        const appRuntime = (<LogicAppRuntime>app.runtime);

        const builder = item.buildProperties();
        builder.add('Count', _.keys(appRuntime.volumes).length);

        builder.build();

    })
    ;