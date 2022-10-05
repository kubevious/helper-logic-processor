import _ from 'the-lodash';

import { LogicLauncherParser } from '../../parser-builder/logic';
import { NodeKind, PropsId, PropsKind } from '@kubevious/entity-meta';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime }) => {

        const app = item.parent!;

        const podTemplate = app.fetchByNaming(NodeKind.podtmpl, item.naming);
        podTemplate.setConfig(runtime.podTemplateSpec);

        podTemplate.addProperties({
            kind: PropsKind.yaml,
            id: PropsId.config,
            config: podTemplate.config
        });
    })
    ;
