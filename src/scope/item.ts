import _ from 'the-lodash';

import { PropertiesBuilder } from '../properties-builder';
import { LogicItem } from '../item';
import { AppScope } from './app'

export class ItemScope
{
    private _parent : any;
    private _kind : string;
    private _name : string;
    private _config : any;

    private _usedBy : Record<string, LogicItem> = {};
    private _owners : Record<string, LogicItem> = {};
    private _data : Record<string, any> = {};
    private _items : LogicItem[] = [];
    private _appScopes : Record<string, AppScope> = {};
    private _createdAlerts : {kind : string,
        severity : string,
        msg : string }[] = [];

    constructor(parent : any, kind: string, name: string, config : any)
    {
        this._parent = parent;
        this._kind = kind;
        this._name = name;
        this._config = config;
    }

    get parent() {
        return this._parent;
    }

    get kind() {
        return this._kind;
    }

    get name() {
        return this._name;
    }

    get config() {
        return this._config;
    }

    get data() {
        return this._data;
    }

    get usedByDns() {
        return _.keys(this._usedBy);
    }

    get usedBy() {
        return _.values(this._usedBy);
    }

    get usedByCount() {
        return this.usedBy.length;
    }

    get isNotUsed() {
        return this.usedByCount == 0;
    }

    get isUsedByOne() {
        return this.usedByCount == 1;
    }

    get isUsedByMany() {
        return this.usedByCount > 1;
    }

    get owners() {
        return _.values(this._owners);
    }

    get ownerCount() {
        return this.owners.length;
    }

    get hasNoOwner() {
        return this.ownerCount == 0;
    }

    get hasOneOwner() {
        return this.ownerCount == 1;
    }

    get hasManyOwners() {
        return this.ownerCount > 1;
    }

    get items() {
        return this._items;
    }

    get appItems() {
        return this.appScopes.map(x => x.item);
    }

    get appScopes() {
        return _.values(this._appScopes);
    }

    markUsedBy(item : LogicItem)
    {
        this._usedBy[item.dn] = item;
    }
    
    registerItem(item : LogicItem)
    {
        this._items.push(item);
    }

    registerOwnerItem(item : LogicItem)
    {
        this._owners[item.dn] = item;
    }

    associateAppScope(appScope : AppScope)
    {
        this._appScopes[appScope.name] = appScope;
    }

    setFlag(flag: string, params: any)
    {
        for(var item of this.items)
        {
            item.setFlag(flag, params);
        }
    }

    setPropagatableFlag(flag: string)
    {
        for(var item of this.items)
        {
            item.setPropagatableFlag(flag);
        }
    }

    addPropertyGroup(groupConfig: any)
    {
        for(var item of this.items)
        {
            item.addProperties(groupConfig);
        }
    }
    
    // TODO: Separated from addProperties.
    addPropBuilder(builder: PropertiesBuilder)
    {
        let config = builder.build();
        this.addProperties(config);
    }

    addProperties(config: Record<string, any>)
    {
        var groupConfig = {
            kind: "key-value",
            id: "properties",
            title: "Properties",
            order: 5,
            config: config
        }
        this.addPropertyGroup(groupConfig);
    }

    buildProperties()
    {
        var builder = new PropertiesBuilder(this.config, (props: Record<string, any>) => {
            this.addProperties(props);
            return props;
        });
        return builder;
    }

    createAlert(kind: string, severity: string, msg: string) {
        this._createdAlerts.push({
            kind,
            severity,
            msg
        });
    }

    finalize()
    {
        for(var alertInfo of this._createdAlerts)
        {
            for(var item of this.items)
            {
                item.addAlert(alertInfo.kind, alertInfo.severity, alertInfo.msg);
            }
        }
    }

}