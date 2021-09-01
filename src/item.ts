import _ from 'the-lodash';

import { LogicScope } from './scope';
import { AppScope } from './scope/app';

import { PropertiesBuilder } from './properties-builder';

import * as DocsHelper from '@kubevious/helpers/dist/docs';

import { Alert, SnapshotNodeConfig, SnapshotPropsConfig } from '@kubevious/helpers/dist/snapshot/types'

import { DumpWriter } from 'the-logger';

import { LogicItemLinker } from './logic/item-linker';

export class LogicItemData
{
    config : Record<string, any> = {};
    properties : Record<string, SnapshotPropsConfig> = {};
    alerts : Record<string, Alert> = {};
}

export class LogicItem
{
    private _logicScope : LogicScope;
    private _parent : LogicItem | null = null;
    private _kind : string;
    private _naming : any;
    private _dn : string;
    private _rn : string;
    private _namingArray : string[] = [];

    private _shadowOf : string | null = null;
    private _data : LogicItemData = {
        config: {},
        properties: {},
        alerts: {},
    }

    private _runtime : Record<string, any> = {};

    private _appScope? : AppScope;

    private _order = 100;
    private _children : Record<string, LogicItem> = {};

    private _flags : Record<string, FlagInfo> = {};
    private _usedBy : Record<string, any> = {};

    private _linker : LogicItemLinker;

    constructor(logicScope: LogicScope, parent: LogicItem | null, kind: string, naming: any)
    {
        this._logicScope = logicScope;
        this._kind = kind;
        this._naming = naming;
        this._rn = LogicItem._makeRn(kind, naming);

        this._linker = new LogicItemLinker(logicScope);

        if (parent) {
            this._parent = parent;
            this._parent._children[this.rn] = this;
            
            this._dn = this._parent.dn + '/' + this.rn;

            this._namingArray = _.clone(this._parent.namingArray);
            this._namingArray.push(this.naming);
        } else {
            this._parent = null;
            
            this._dn = this.rn;

            this._namingArray = [this.naming];
        }
 
        this._logicScope._acceptItem(this);
    }

    get shadowOf() {
        return this._shadowOf;
    }
    
    get runtime() {
        return this._runtime;
    }

    get kind() {
        return this._kind;
    }

    get prettyKind() {
        return DocsHelper.prettyKind(this.kind);
    }

    get naming() {
        return this._naming;
    }

    get namingArray() {
        return this._namingArray;
    }
    
    get rn() {
        return this._rn;
    }
    
    get config() {
        return this._data.config;
    }

    get flags() {
        return this._flags;
    }

    get parent() : LogicItem | null {
        return this._parent;
    }

    get dn() {
        return this._dn;
    }

    get id() {
        return this.dn;
    }

    get order() {
        return this._order;
    }

    set order(value) {
        this._order = value;
    }

    get appScope() : AppScope {
        return this._appScope!;
    }

    get properties() {
        return this._data.properties;
    }

    get alerts() {
        return this._data.alerts;
    }

    makeShadowOf(other: LogicItem)
    {
        this._shadowOf = other.dn;
        this._data = other._data;
    }

    link(kind: string, targetItemOrDn: LogicItem | string)
    {
        return this._linker.link(kind, targetItemOrDn);
    }

    findLink(kind: string)
    {
        return this._linker.findLink(kind);
    }

    resolveLink(kind: string)
    {
        return this._linker.resolveLink(kind);
    }

    getAllLinks()
    {
        return this._linker.getAllLinks();
    }

    associateAppScope(scope: AppScope) {
        this._appScope = scope;
    }

    setPropagatableFlag(name: string)
    {
        return this.setFlag(name, { propagatable: true });
    }

    setFlag(name: string, params?: Partial<FlagInfo>)
    {
        if (params) {
            params = _.clone(params);
        } else {
            params = {}
        }
        params.name = name;
        if (!params.propagatable) {
            params.propagatable = false;
        }
        this._flags[name] = <FlagInfo>params;
    }

    hasFlag(name: string)
    {
        if (this._flags[name])
            return true;
        return false;
    }

    getFlags()
    {
        return _.values(this._flags);
    }

    setUsedBy(dn: string)
    {
        this._usedBy[dn] = true;
    }

    setConfig(value: any) 
    {
        this._data.config = value;
    }    

    getChildren() : LogicItem[] {
        return _.values(this._children);
    }

    getChildrenByKind(kind: string) : LogicItem[] {
        return _.values(this._children).filter(x => x.kind == kind);
    }

    remove() {
        if (!this._parent) {
            return;
        }
        this._logicScope._dropItem(this);
        delete this._parent._children[this.rn];
        this._parent = null;
    }

    findByNaming(kind: string, naming: any) : LogicItem | null
    {
        let rn = LogicItem._makeRn(kind, naming);
        return this.findByRn(rn);
    }

    findByRn(rn: string) : LogicItem | null
    {
        let child = this._children[rn];
        if (child) {
            return child;
        }
        return null;
    }

    fetchByNaming(kind: string, naming: any) : LogicItem
    {
        let rn = LogicItem._makeRn(kind, naming);
        let child = this._children[rn];
        if (child) {
            return child;
        }
        child = new LogicItem(this._logicScope, this, kind, naming);
        return child;
    }

    addProperties(params: SnapshotPropsConfig)
    {
        if (!params.order) {
            params.order = 10;
        }
        this.properties[params.id] = params;
    }

    getProperties(id: string) : SnapshotPropsConfig | null
    {
        if (this.properties[id]) {
            return this.properties[id];
        }
        return null;
    }

    buildProperties()
    {
        let builder = new PropertiesBuilder(this.config, (props: Record<string, any>) => {
            this.addProperties({
                kind: "key-value",
                id: "properties",
                title: "Properties",
                order: 5,
                config: props
            });
            return props;
        });
        return builder;
    }

    addAlert(kind: string, severity: string, msg: string)
    {
        let info : Alert = {
            id: kind,
            severity: severity,
            msg: msg
        }
        let key = _.stableStringify(info);
        this.alerts[key] = info;
    }

    cloneAlertsFrom(other: LogicItem)
    {
        for(let x of _.values(other.alerts)) {
            this.alerts[x.id] = x;
        }
    }

    extractProperties() : SnapshotPropsConfig[] {
        let myProps = _.values(this.properties);

        if (_.keys(this._usedBy).length > 0) {
            myProps.push({
                kind: "dn-list",
                id: "shared-with",
                title: "Shared With",
                order: 5,
                config: _.keys(this._usedBy)
            });   
        }
        myProps = _.deepClean(myProps);

        return myProps;
    }

    extractAlerts() : Alert[] {
        let alerts = _.values(this.alerts);
        alerts = _.deepClean(alerts);
        return alerts;
    }

    debugOutputToFile(writer : DumpWriter, options? : any)
    {
        writer.write('-) ' + this.dn);
       
        writer.indent();

        writer.write('Order: ' + this.order);
        // writer.write('RN: ' + this.rn);
     
        if (options && options.includeConfig) {
            if (this.config && (_.keys(this.config).length > 0))
            {
                writer.write('Config:');
                writer.indent();
                writer.write(this.config);
                writer.unindent();
            }
        }

        writer.unindent();

        for(let child of this.getChildren())
        {
            child.debugOutputToFile(writer, options);
        }
    }

    exportNode() : SnapshotNodeConfig
    {
        let node = {
            rn: this.rn,
            name: this.naming,
            kind: this.kind,
            order: this.order,
            flags: this._flags
        };
        (<any>node).dn = this.dn;

        if (this._shadowOf) {
            (<any>node).shadowOf = this._shadowOf;
        }
        return _.deepClean(node);
    }

    static constructTop(scope: LogicScope, name: string) : LogicItem {
        return new LogicItem(scope, null, name, null);
    }

    static _makeRn(kind: string, naming: any) {
        if (naming && naming.length > 0)  {
            return kind + '-[' + naming + ']'; 
        }
        return kind;
    }
}

export interface FlagInfo
{
    name : string;
    propagatable : boolean;
}