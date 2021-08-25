import { IConcreteRegistry, LogicProcessor } from "../..";
import { BaseParserExecutor } from "./executor";

export interface ParserBuilder {
    isOnly() : boolean;
    shouldSkip() : boolean;
    
    _extract(registry: IConcreteRegistry, processor : LogicProcessor, name: string) : BaseParserExecutor[]
}

export interface BaseParserInfo
{
    targetKind: string;
    target?: any;
}

export class BaseParserBuilder<TTarget>
{
    private _isOnly: boolean = false;
    private _shouldSkip: boolean = false;
    protected _targets : TTarget[] = [];

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
}