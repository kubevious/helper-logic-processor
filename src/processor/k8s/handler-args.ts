import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicScope } from "../../scope";

import { Helpers } from '../../helpers';
import { LogicItem } from '../../item';
import { ObjectMeta } from 'kubernetes-types/meta/v1';

export interface K8sProcessorHandlerArgs<TConfig, TRuntime>
{
    readonly logger : ILogger;
    readonly scope : LogicScope;
    readonly item : LogicItem;
    readonly config : TConfig;
    readonly runtime : TRuntime;
    readonly helpers : Helpers;

    readonly namespace : string | null;
    readonly metadata: ObjectMeta;
}
