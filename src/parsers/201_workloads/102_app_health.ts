import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicCommonWorkload } from '../../types/parser/logic-common';

export default LogicAppParser()
    .handler(({ logger, scope, item, runtime, config, helpers }) => {

        const launcherItems = item.getChildrenByKind(NodeKind.launcher);

        helpers.logic.health.mergeHealthRuntime(runtime, launcherItems.map(child => child.runtime as LogicCommonWorkload));
        
        helpers.logic.health.buildHealthProperties(item, runtime);

    })
    ;