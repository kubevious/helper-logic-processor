import _ from 'the-lodash';

import { NodeKind, FlagKind } from '@kubevious/entity-meta';
import { ValidatorID, ValidatorSetting } from '@kubevious/entity-meta';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

import { LogicScope, LogicTarget } from "./scope";

import { PropertiesBuilder } from '../utils/properties-builder';

import { Alert, AlertSourceKind, SnapshotNodeConfig, SnapshotPropsConfig } from '@kubevious/state-registry'

import { DumpWriter } from 'the-logger';
import { LogicLinkRegistry } from '../logic/linker/registry';
import { SeverityType } from './types';
import { LogicLinkKind } from './link-kind';

class LogicItemSharedData
{
    config : Record<string, any> = {};
    properties : Record<string, SnapshotPropsConfig> = {};
    alerts : Record<string, Alert> = {};
    flags : Record<string, FlagInfo> = {};
    uses : { [dn : string] : boolean } = {};
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
    private _data : LogicItemSharedData = {
        config: {},
        properties: {},
        alerts: {},
        flags: {},
        uses: {}
    }

    private _selfProperties : Record<string, SnapshotPropsConfig> = {};

    private _runtime : Record<string, any> = {};

    private _children : Record<string, LogicItem> = {};

    private _usedBy : Record<string, any> = {};

    private _linkRegistry : LogicLinkRegistry;

    constructor(logicScope: LogicScope,
                parent: LogicItem | null,
                kind: NodeKind,
                name?: string | null | undefined)
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

    get usedDns() {
        return this._data.uses;
    }

    makeShadowOf(other: LogicItem)
    {
        this._shadowOf = other.dn;
        this._data = other._data;
    }

    markUses(other: LogicItem | string)
    {
        if (_.isString(other))
        {
            this._data.uses[other] = true;
        }
        else
        {
            this._data.uses[other.dn] = true; 
        }
    }

    link(kind: LogicLinkKind, targetItemOrDn: LogicItem | string, path?: any) : LogicItem | null
    {
        return this._linkRegistry.link(this.dn, kind, path, targetItemOrDn);
    }

    resolveTargetLinks(kind?: LogicLinkKind)
    {
        return this._linkRegistry.resolveTargetLinks(this.dn, kind);
    }

    resolveSourceLinks(kind?: LogicLinkKind)
    {
        return this._linkRegistry.resolveSourceLinks(this.dn, kind);
    }

    resolveTargetLinkItems(kind?: LogicLinkKind)
    {
        return this._linkRegistry.resolveTargetItems(this.dn, kind);
    }

    resolveTargetLinkItem(kind?: LogicLinkKind) : LogicItem | null
    {
        const items = this._linkRegistry.resolveTargetItems(this.dn, kind);
        if (items.length == 0) {
            return null;
        }
        // TODO: Handle the case of multiple items;
        return items[0];
    }

    resolveSourceLinkItems(kind?: LogicLinkKind)
    {
        return this._linkRegistry.resolveSourceItems(this.dn, kind);
    }

    setPropagatableFlag(name: FlagKind)
    {
        return this.setFlag(name, { propagatable: true });
    }

    setFlag(name: FlagKind, params?: Partial<FlagInfo>)
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

    getChildrenByKind(kind: NodeKind) : LogicItem[] {
        return _.values(this._children).filter(x => x.kind == kind);
    }

    countChildren() : number {
        return this.getChildren().length;
    }

    countChildrenByKind(kind: NodeKind) : number {
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

    findByNaming(kind: NodeKind, name?: string | undefined) : LogicItem | null
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
            kind: PropsKind.keyValue,
            id: PropsId.properties,
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

    raiseAlert(validator: ValidatorID, msg: string)
    {
        const config = this._logicScope.getValidatorSetting(validator);
        if (!config) {
            return;
        }
        if (config === ValidatorSetting.error) {
            this._addAlert(validator, 'error', msg);
        }
        if (config === ValidatorSetting.warn) {
            this._addAlert(validator, 'warn', msg);
        }
    }

    private _addAlert(validator: ValidatorID, severity: SeverityType, msg: string)
    {
        const kind = AlertSourceKind.validator;

        const alert : Alert = {
            id: `${kind}-${validator}`,
            severity: severity,
            msg: msg,
            source: {
                kind: kind,
                id: validator
            }
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

    static _makeRn(kind: NodeKind, name?: string | null | undefined) {
        if (name && name.length > 0)  {
            return kind + '-[' + name + ']'; 
        }
        return kind;
    }
}

export interface FlagInfo
{
    name : FlagKind;
    propagatable : boolean;
}

export interface NewPropsParams
{ 
    isSelfProps?: boolean 
}