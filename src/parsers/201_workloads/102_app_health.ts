import _ from 'the-lodash';
import { LogicAppParser } from '../../parser-builder/logic';
import { LogicCommonWorkload } from '../../types/parser/logic-common';
import { LogicLinkKind } from '../../logic/link-kind';

export default LogicAppParser()
    .handler(({ logger, scope, item, runtime, config, helpers }) => {

        const launcherItems = item.resolveTargetLinkItems(LogicLinkKind.launcher);

        helpers.logic.health.mergeHealthRuntime(runtime, launcherItems.map(child => child.runtime as LogicCommonWorkload));
        
        helpers.logic.health.buildHealthProperties(item, runtime);

    })
    ;