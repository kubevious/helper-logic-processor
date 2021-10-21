import { NodeKind } from "@kubevious/entity-meta";
import { ILogger } from "the-logger";
import { Helpers } from ".";
import { LogicItem } from "../logic/item";
import { LogicScope } from '../logic/scope';

export class ShadowUtils
{
    private _helpers: Helpers;
    private _logger: ILogger;
    private _scope : LogicScope;

    constructor(helpers: Helpers, logger: ILogger, scope: LogicScope)
    {
        this._helpers = helpers;
        this._logger = logger.sublogger('ShadowUtils');
        this._scope = scope;
    }

    create(source: LogicItem, targetParent: LogicItem, params? : CreateShadowParams) : LogicItem
    {
        params = params || {};

        const shadowKind = params.kind ?? source.kind;
        const shadowName = params.name ?? source.naming;
        const shadowItem = targetParent.fetchByNaming(shadowKind, shadowName);

        shadowItem.makeShadowOf(source);

        if (!params.skipUsageRegistration)
        {
            this._helpers.usage.register(source, shadowItem);
        }

        if (params.linkName)
        {
            shadowItem.link(params.linkName, source);
        }

        if (params.inverseLinkName)
        {
            source.link(params.inverseLinkName, shadowItem, params.inverseLinkPath);
        }

        return shadowItem;
    }
}   

export interface CreateShadowParams
{
    kind?: NodeKind;
    name?: string;

    skipUsageRegistration?: boolean;
    
    // Link from shadow to source
    linkName?: string;

    // Link from source to shadow
    inverseLinkName?: string;
    inverseLinkPath?: string;


}