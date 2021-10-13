import _ from 'the-lodash';

import { LogicScope, LogicTarget } from "./scope";

import { PropertiesBuilder } from '../utils/properties-builder';

import * as DocsHelper from '@kubevious/helpers/dist/docs';

import { Alert, SnapshotNodeConfig, SnapshotPropsConfig } from '@kubevious/state-registry'

import { DumpWriter } from 'the-logger';
import { LogicLinkRegistry } from '../logic/linker/registry';
import { SeverityType } from './types';
import { NodeKind } from '@kubevious/entity-meta';

export class LogicItemData
{
    config : Record<string, any> = {};
    properties : Record<string, SnapshotPropsConfig> = {};
    alerts : Record<string, Alert> = {};
    flags : Record<string, FlagInfo> = {};
}

export class LogicItem
{
    private _logicScope : LogicScope;
    private _parent : LogicItem | null = null;
    private _kind : NodeKind;
    private _naming : any;
    private _dn : string;
    private _rn : string;
    private _namingArray : string[] = [];

    private _shadowOf : string | null = null;
    private _data : LogicItemData = {
        config: {},
        properties: {},
        alerts: {},
        flags: {}
    }

    private _selfProperties : Record<string, SnapshotPropsConfig> = {};

    private _runtime : Record<string, any> = {};

    private _order = 100;
    private _children : Record<string, LogicItem> = {};

    private _usedBy : Record<string, any> = {};

    private _linkRegistry : LogicLinkRegistry;

    constructor(logicScope: LogicScope, parent: LogicItem | null, kind: NodeKind, name?: string | null | undefined)
    {
        this._logicScope = logicScope;
        this._kind = kind;
        this._naming = name;
        this._rn = LogicItem._makeRn(kind, name);

        this._linkRegistry = logicScope.linkRegistry;

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
        return this._data.flags;
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

    makeShadowOf(other: LogicItem)
    {
        this._shadowOf = other.dn;
        this._data = other._data;
    }

    link(kind: string, targetItemOrDn: LogicItem | string, path?: any) : LogicItem | null
    {
        return this._linkRegistry.link(this.dn, kind, path, targetItemOrDn);
    }

    resolveTargetLinks(kind?: string)
    {
        return this._linkRegistry.resolveTargetLinks(this.dn, kind);
    }

    resolveSourceLinks(kind?: string)
    {
        return this._linkRegistry.resolveSourceLinks(this.dn, kind);
    }

    resolveTargetLinkItems(kind?: string)
    {
        return this._linkRegistry.resolveTargetItems(this.dn, kind);
    }

    resolveTargetLinkItem(kind?: string) : LogicItem | null
    {
        const items = this._linkRegistry.resolveTargetItems(this.dn, kind);
        if (items.length == 0) {
            return null;
        }
        // TODO: Handle the case of multiple items;
        return items[0];
    }

    resolveSourceLinkItems(kind?: string)
    {
        return this._linkRegistry.resolveSourceItems(this.dn, kind);
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
        this._data.flags[name] = <FlagInfo>params;
    }

    hasFlag(name: string)
    {
        if (this._data.flags[name])
            return true;
        return false;
    }

    getFlags()
    {
        return _.values(this._data.flags);
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

    countChildren() : number {
        return this.getChildren().length;
    }

    countChildrenByKind(kind: string) : number {
        return this.getChildrenByKind(kind).length;
    }

    // remove() {
    //     if (!this._parent) {
    //         return;
    //     }
    //     this._logicScope._dropItem(this);
    //     delete this._parent._children[this.rn];
    //     this._parent = null;
    // }

    findByNaming(kind: string, name?: string | undefined) : LogicItem | null
    {
        const rn = LogicItem._makeRn(kind, name);
        return this.findByRn(rn);
    }

    findByRn(rn: string) : LogicItem | null
    {
        const child = this._children[rn];
        if (child) {
            return child;
        }
        return null;
    }

    fetchByNaming(kind: NodeKind, name?: string | undefined) : LogicItem
    {
        const rn = LogicItem._makeRn(kind, name);
        let child = this._children[rn];
        if (child) {
            return child;
        }
        child = new LogicItem(this._logicScope, this, kind, name);
        return child;
    }

    findItemsByPath(logicTarget : LogicTarget) : LogicItem[]
    {
        return this._logicScope.findItemsByPath(logicTarget, this);
    }

    countItemsByPath(logicTarget : LogicTarget) : number
    {
        return this._logicScope.countItemsByPath(logicTarget, this);
    }

    addProperties(props: SnapshotPropsConfig, params?: NewPropsParams)
    {
        if (!props.order) {
            props.order = 10;
        }

        params = params || {};
        if (params.isSelfProps) {
            this._selfProperties[props.id] = props;
        } else {
            this._data.properties[props.id] = props;
        }
    }

    getProperties(id: string) : SnapshotPropsConfig | null
    {
        if (this._data.properties[id]) {
            return this._data.properties[id];
        }
        if (this._selfProperties[id]) {
            return this._selfProperties[id];
        }
        return null;
    }

    buildProperties(params?: NewPropsParams)
    {
        return this.buildCustomProperties({
            kind: "key-value",
            id: "properties",
            title: "Properties",
            order: 5,
            config: undefined
        }, params);
    }

    buildCustomProperties(propsConfig: SnapshotPropsConfig, params?: NewPropsParams)
    {
        const builder = new PropertiesBuilder(this.config, (props: Record<string, any>) => {
            propsConfig.config = props;
            this.addProperties(propsConfig, params);
            return props;
        });
        return builder;
    }

    addAlert(kind: string, severity: SeverityType, msg: string)
    {
        const alert : Alert = {
            id: kind,
            severity: severity,
            msg: msg
        }
        const key = _.stableStringify(alert);
        this._data.alerts[key] = alert;

        this._logicScope._recordAlert(this, alert);
    }

    extractProperties() : SnapshotPropsConfig[] {
        let myProps = [
            ... _.values(this._data.properties),
            ... _.values(this._selfProperties)
        ];

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
        const alerts = _.values(this._data.alerts);
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

        for(const child of this.getChildren())
        {
            child.debugOutputToFile(writer, options);
        }
    }

    exportNode() : SnapshotNodeConfig
    {
        const node = {
            rn: this.rn,
            name: this.naming,
            kind: this.kind,
            order: this.order,
            flags: this._data.flags
        };
        // (<any>node).dn = this.dn;

        if (this._shadowOf) {
            (<any>node).shadowOf = this._shadowOf;
        }
        return _.deepClean(node);
    }

    static constructTop(scope: LogicScope, kind: NodeKind) : LogicItem {
        return new LogicItem(scope, null, kind, null);
    }

    static _makeRn(kind: string, name?: string | null | undefined) {
        if (name && name.length > 0)  {
            return kind + '-[' + name + ']'; 
        }
        return kind;
    }
}

export interface FlagInfo
{
    name : string;
    propagatable : boolean;
}

export interface NewPropsParams
{ 
    isSelfProps?: boolean 
}