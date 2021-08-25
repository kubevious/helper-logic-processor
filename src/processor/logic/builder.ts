import _ from 'the-lodash';
import { LogicProcessor } from '..';
import { IConcreteRegistry } from '../..';
import { LogicItem } from '../../item';

import { BaseParserInfo, ParserBuilder, BaseParserBuilder } from '../base/builder';
import { BaseParserExecutor } from '../base/executor';
import { LogicParserExecutor } from './executor';

import { LogicProcessorHandlerArgs } from './handler-args';

export interface LogicTarget {
    path: (LogicTargetPathElement | string)[],
}

export interface LogicTargetFinal {
    path: LogicTargetPathElement[]
}

export interface LogicTargetPathElement {
    kind: string;
    name?: string;
}

export interface LogicParserInfo extends BaseParserInfo
{
    target?: LogicTargetFinal;

    needAppScope?: boolean;
    canCreateAppIfMissing? : boolean;
    appNameCb?: (item : LogicItem) => string;

    kind?: string,

    needNamespaceScope?: boolean;
    namespaceNameCb? : (item : LogicItem) => string;

    handler? : (args : LogicProcessorHandlerArgs) => void;
}

export class LogicParserBuilder extends BaseParserBuilder<LogicTarget> implements ParserBuilder
{
    private _data : LogicParserInfo = {
        targetKind: 'logic'
    };


    target(value : LogicTarget) : LogicParserBuilder
    {
        this._targets.push(value);
        return this;
    }

    needNamespaceScope(value : boolean) : LogicParserBuilder
    {
        this._data.needNamespaceScope = value;
        return this;
    }

    namespaceNameCb(value : (item : LogicItem) => string) : LogicParserBuilder
    {
        this._data.namespaceNameCb = value;
        return this;
    }

    kind(value : string) : LogicParserBuilder
    {
        this._data.kind = value;
        return this;
    }

    handler(value : (args : LogicProcessorHandlerArgs) => void) : LogicParserBuilder
    {
        this._data.handler = value;
        return this;
    }

    _extract(registry: IConcreteRegistry, processor : LogicProcessor, name: string) : BaseParserExecutor[]
    {
        return this._targets.map(target => {
            let parserInfo = _.clone(this._data);
            parserInfo.target = this._makeTarget(target);

            let executor = new LogicParserExecutor(
                processor,
                name,
                parserInfo)

            return executor;
        });
    }

    private _makeTarget(target: LogicTarget) : LogicTargetFinal
    {
        const result: LogicTargetFinal = {
            path: target.path.map(x => {
                if (_.isString(x)) {
                    return {
                        kind: x
                    }
                } else {
                    return x;
                }
            })
        }
        return result;
    }
}
