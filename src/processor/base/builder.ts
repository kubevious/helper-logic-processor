import _ from 'the-lodash';
import { IConcreteRegistry, LogicProcessor } from "../..";
import { BaseParserExecutor } from "./executor";

export interface ParserBuilder {
    isOnly() : boolean;
    isBreakpoint() : boolean;
    shouldSkip() : boolean;
    doesSurviveBreakpoint() : boolean;

    _extract(registry: IConcreteRegistry, processor : LogicProcessor, name: string) : BaseParserExecutor[]
}

export interface BaseParserInfo
{
    targetKind: string;
    target?: any;
}

export class BaseParserBuilder<TTarget>
{
    private _trace: boolean = false;
    private _isTraceDnFiltered: boolean = false;
    private _traceDnList: { [dn : string] : boolean } = {};
    private _isOnly: boolean = false;
    private _isBreakpoint: boolean = false;
    private _survivesBreakpoint: boolean = false;
    private _shouldSkip: boolean = false;
    protected _targets : TTarget[] = [];


    constructor()
    {
    }

    trace(noneDnOrDns? : string | string[] ) {
        this._trace = true;
        if (noneDnOrDns) {
            if (_.isString(noneDnOrDns)) {
                this._isTraceDnFiltered = true;
                this._traceDnList[noneDnOrDns] = true;
            } else if (_.isArray(noneDnOrDns)) {
                for(const dn of noneDnOrDns) {
                    this._isTraceDnFiltered = true;
                    this._traceDnList[dn] = true;
                }
            }
        }
        return this;
    }

    only() {
        this._isOnly = true;
        return this;
    }

    breakpoint() {
        this._isBreakpoint = true;
        return this;
    }

    survivesBreakpoint() {
        this._survivesBreakpoint = true;
        return this;
    }

    skip() {
        this._shouldSkip = true;
        return this;
    }

    isTraceEnabled()
    {
        return this._trace;
    }

    isDnTraceEnabled(dn: string)
    {
        if (this._isTraceDnFiltered) {
            if (this._traceDnList[dn]) {
                return true;
            } else {
                return false;
            }
        }
        return this._trace;
    }

    isOnly()
    {
        return this._isOnly
    }

    isBreakpoint()
    {
        return this._isBreakpoint;
    }

    doesSurviveBreakpoint() {
        return this._survivesBreakpoint;
    }

    shouldSkip()
    {
        return this._shouldSkip;
    }
}