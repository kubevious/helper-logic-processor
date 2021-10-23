import { LogicCommonWorkload } from './logic-common';

export interface LogicLauncherRuntime extends LogicCommonWorkload
{
    radioactiveProps: { [ kind : string ] : boolean };
}