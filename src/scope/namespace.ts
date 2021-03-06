import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicItem } from '../item';
import { ItemScope } from './item';
import { ItemsScope } from './items';
import { AppScope } from './app';
import { LabelMatcher } from './label-matcher';

export class NamespaceScope
{
    private _parent : any;
    private _name : string;
    private _logger : ILogger;

    private _item : ItemScope;
    private _appScopes : Record<string, AppScope> = {};
    private _items : ItemsScope;
    
    private _appLabelMatcher : LabelMatcher<AppScope>;
    private _appOwners : Record<string, Record<string, LogicItem[]>> = {};

    constructor(parent: any, name: string)
    {
        this._parent = parent;
        this._logger = parent.logger;
        this._name = name;

        this._item = this._parent.root.fetchByNaming("ns", name);

        this._items = new ItemsScope(this);

        this._appLabelMatcher = new LabelMatcher();
    }

    get logger() {
        return this._logger;
    }

    get name() {
        return this._name;
    }

    get item() {
        return this._item;
    }

    get items() {
        return this._items;
    }

    get appScopes() {
        return _.values(this._appScopes);
    }

    get appCount() {
        return this.appScopes.length;
    }

    getAppAndScope(name: string, createIfMissing: boolean) : AppScope | null
    {
        var appScope = this._appScopes[name];
        if (!appScope)
        {
            if (!createIfMissing)
            {
                return null;
            }
        }

        var appScope = new AppScope(this, name);
        this._appScopes[name] = appScope;
        return appScope;
    }

    registerAppOwner(owner: LogicItem)
    {
        if (!this._appOwners[owner.config.kind]) {
            this._appOwners[owner.config.kind] = {};
        }
        if (!this._appOwners[owner.config.kind][owner.config.metadata.name]) {
            this._appOwners[owner.config.kind][owner.config.metadata.name] = [];
        }
        this._appOwners[owner.config.kind][owner.config.metadata.name].push(owner);
    }

    getAppOwners(kind: string, name: string) : LogicItem[]
    {
        if (!this._appOwners[kind]) {
            return []
        }
        if (!this._appOwners[kind][name]) {
            return []
        }
        return this._appOwners[kind][name];
    }

    registerAppScopeLabels(appScope: AppScope, labelsMap: Record<string, any>)
    {
        this._appLabelMatcher.register(labelsMap, appScope);
    }

    findAppScopesByLabels(selector: Record<string, any>) : AppScope[]
    {
        return this._appLabelMatcher.match(selector);
    }
}
