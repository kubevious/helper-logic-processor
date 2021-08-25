import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicScope } from "../../scope";

import { Helpers } from '../../helpers';
import { LogicItem } from '../../item';

import { K8sConfig } from '../..';

export interface K8sProcessorHandlerArgs<TConfig>
{
    readonly logger : ILogger;
    readonly scope : LogicScope;
    readonly item : LogicItem;
    readonly config : TConfig;
    readonly helpers : Helpers;
}