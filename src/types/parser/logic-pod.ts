import { LogicCommonWorkload } from './logic-common';

export interface LogicPodRuntime  extends LogicCommonWorkload
{
    radioactiveProps: { [ kind : string ] : boolean };
}