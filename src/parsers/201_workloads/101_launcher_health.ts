import _ from 'the-lodash';
import { LogicLauncherParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicCommonWorkload } from '../../types/parser/logic-common';
import { LogicItem } from '../..';

export default LogicLauncherParser()
    .handler(({ logger, scope, item, runtime, config, helpers }) => {

        function calculateHealthR(x : LogicItem) {
            if (x.kind === NodeKind.pod) {
                return;
            } 

            const children = x.getChildren();
            for(const child of children) {
                calculateHealthR(child);
            }

            const xRuntime = x.runtime as LogicCommonWorkload;
            helpers.logic.health.mergeHealthRuntime(xRuntime, children.map(child => child.runtime as LogicCommonWorkload));

            helpers.logic.health.buildHealthProperties(x, xRuntime);
        }

        calculateHealthR(item);
    })
    ;