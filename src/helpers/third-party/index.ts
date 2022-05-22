import _ from 'the-lodash';

import { ILogger } from "the-logger";

import { Helpers } from '..';
import { LogicScope } from '../../logic/scope';
import { TraefikUtils } from './traefik';

export class ThirdPartyUtils
{
    private _helpers: Helpers;
    private _logger: ILogger;
    private _scope : LogicScope;

    private _traefik: TraefikUtils;

    constructor(helpers: Helpers, logger: ILogger, scope: LogicScope)
    {
        this._helpers = helpers;
        this._logger = logger;
        this._scope = scope;

        this._traefik = new TraefikUtils(helpers, logger, scope);
    }

    get traefik() {
        return this._traefik;
    }
}