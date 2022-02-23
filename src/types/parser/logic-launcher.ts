import { PodTemplateSpec } from 'kubernetes-types/core/v1';
import { LogicCommonWorkload } from './logic-common';

export interface LogicLauncherRuntime extends LogicCommonWorkload
{
    podTemplateSpec?: PodTemplateSpec;
    radioactiveProps: { [ kind : string ] : boolean };
}