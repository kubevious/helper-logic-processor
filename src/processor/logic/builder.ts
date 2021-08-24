import _ from 'the-lodash';
import { LogicItem } from '../../item';

import { BaseParserInfo, BaseParserBuilder } from '../base/builder';

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

export class LogicParserBuilder implements BaseParserBuilder
{
    private _isOnly: boolean = false;
    private _shouldSkip: boolean = false;

    private _data : LogicParserInfo = {
        targetKind: 'logic'
    };

    private _targets : (LogicTarget)[] = [];

    constructor()
    {
    }

    only() {
        this._isOnly = true;
        return this;
    }

    skip() {
        this._shouldSkip = true;
        return this;
    }

    isOnly()
    {
        return this._isOnly
    }

    shouldSkip()
    {
        return this._shouldSkip;
    }

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

    _extract() : LogicParserInfo[]
    {
        return this._targets.map(target => {
            let data = _.clone(this._data);
            data.target = this._makeTarget(target);
            return data;
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
