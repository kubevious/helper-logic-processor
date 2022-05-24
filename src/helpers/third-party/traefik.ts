import _ from 'the-lodash';

import { ILogger } from "the-logger";

import { Helpers } from '..';
import { LogicItem } from '../../logic/item';
import { LogicScope } from '../../logic/scope';

export class TraefikUtils
{
    private _helpers: Helpers;
    private _logger: ILogger;
    private _scope : LogicScope;

    private _globalMiddlewares : Record<string, LogicItem> = {}
    private _namespacedMiddlewares : Record<string, Record<string, LogicItem>> = {}
    private _namespacedTLSOptions : Record<string, Record<string, LogicItem>> = {}

    constructor(helpers: Helpers, logger: ILogger, scope: LogicScope)
    {
        this._helpers = helpers;
        this._logger = logger;
        this._scope = scope;
    }

    registerGlobalMiddleware(id: string, item: LogicItem)
    {
        this._globalMiddlewares[id] = item;
    }

    findGlobalMiddleware(id: string)
    {
        return this._globalMiddlewares[id] ?? null;
    }

    registerLocalMiddleware(namespace: string, name: string, item: LogicItem)
    {
        if (!this._namespacedMiddlewares[namespace]) {
            this._namespacedMiddlewares[namespace] = {}
        }
        this._namespacedMiddlewares[namespace][name] = item;
    }

    findLocalMiddleware(namespace: string, name: string)
    {
        if (this._namespacedMiddlewares[namespace]) {
            return this._namespacedMiddlewares[namespace][name] ?? null;
        }
        return null;
    }

    registerTLSOptions(namespace: string, name: string, item: LogicItem)
    {
        if (!this._namespacedTLSOptions[namespace]) {
            this._namespacedTLSOptions[namespace] = {}
        }
        this._namespacedTLSOptions[namespace][name] = item;
    }

    findTLSOptions(namespace: string, name: string)
    {
        if (this._namespacedTLSOptions[namespace]) {
            return this._namespacedTLSOptions[namespace][name] ?? null;
        }
        return null;
    }
}