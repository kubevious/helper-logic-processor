import { ILogger } from "the-logger";
import { LogicItem } from "../logic/item";
import { LogicScope } from '../logic/scope';

export class UsageUtils
{
    private _logger: ILogger;
    private _scope : LogicScope;

    constructor(logger: ILogger, scope: LogicScope)
    {
        this._logger = logger.sublogger('UsageUtils');
        this._scope = scope;
    }

    register(user: LogicItem, target: LogicItem)
    {
        // this._logger.error("[register] %s -> %s", user.dn, target.dn);
        user.markUses(target);
    }
}   