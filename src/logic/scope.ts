import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicItem } from './item';
import { IConcreteRegistry } from '../types/registry';
import { LogicLinkRegistry } from '../logic/linker/registry';

import { Alert } from '@kubevious/state-registry'
import { NodeKind } from '@kubevious/entity-meta';
import { ValidationConfig, ValidatorSetting, DEFAULT_VALIDATION_CONFIG, ValidatorID } from '@kubevious/entity-meta';
import { PersistenceStore } from '../store/presistence-store';
import { LogicLinkKind } from './link-kind';

export const ROOT_NODE_LOGIC = NodeKind.root;

export interface LogicTarget {
    path: (NodeKind | LogicTargetPathElement | LogicTargetLinkElement )[], //   
    subtree?: boolean
}

export interface LogicTargetFinal {
    path: LogicFinalTargetType[],
    subtree: boolean
}

export enum LogicTargetQuery {
    node = "node",
    child = "child",
    descendent = "descendent",
    link = "link"
}

export interface LogicTargetPathElement {
    query: LogicTargetQuery.node,
    kind: NodeKind,
    name?: string,
    descendents?: boolean,
}

export interface LogicTargetLinkElement {
    query: LogicTargetQuery.link,
    kind: LogicLinkKind,
}

export type LogicFinalTargetType = LogicTargetPathElement | LogicTargetLinkElement;


export class LogicScope
{
    private _logger : ILogger;
    private _concreteRegistry : IConcreteRegistry;
    private _validationConfig : ValidationConfig;

    private _rootNode : LogicItem;
    private _itemsMap : Record<string, LogicItem> = {};
    private _itemKindMap : Record<string, Record<string, LogicItem> > = {};
    private _store: PersistenceStore;

    private _lastStageData : StageProcessingData = {
        createdItems: [],
        createdAlerts: []
    };

    private _linkRegistry : LogicLinkRegistry;

    constructor(logger: ILogger,
                concreteRegistry: IConcreteRegistry,
                store: PersistenceStore,
                validationConfig : ValidationConfig)
    {
        this._logger = logger.sublogger("LogicScope");
        this._concreteRegistry = concreteRegistry;
        this._store = store;
        this._validationConfig = validationConfig

        this._linkRegistry = new LogicLinkRegistry(this);

        this._rootNode = LogicItem.constructTop(this, ROOT_NODE_LOGIC);
    }

    get logger() {
        return this._logger;
    }

    get concreteRegistry() {
        return this._concreteRegistry;
    }

    get date() {
        return this._concreteRegistry.date;
    }

    get logicRootNode() {
        return this._rootNode;
    }

    get linkRegistry() {
        return this._linkRegistry;
    }

    get store() {
        return this._store;
    }

    getValidatorSetting(validator: ValidatorID) : ValidatorSetting
    {
        {
            const value = this._validationConfig[validator];
            if (value) {
                return value;
            }
        }
        {
            const defaultConfig = DEFAULT_VALIDATION_CONFIG[validator];
            if (defaultConfig) {
                return defaultConfig;
            }
        }
        return ValidatorSetting.off;
    }

    extractLastedStageData() {
        const last = this._lastStageData;
        this._lastStageData = {
            createdItems: [],
            createdAlerts: []
        };
        return last;
    }

    countItemsByPath(logicTarget : LogicTarget, optionalRootNode? : LogicItem) : number
    {
        return this.findItemsByPath(logicTarget, optionalRootNode).length;
    }

    findItemsByPath(logicTarget : LogicTarget, optionalRootNode? : LogicItem) : LogicItem[]
    {
        const targetFinal = this._makeTarget(logicTarget);

        const items : LogicItem[] = [];
        const rootNode = optionalRootNode ?? this.logicRootNode;
        if (targetFinal.subtree)
        {
            this._visitTreeAll(rootNode, item => {
                items.push(item);
            });
        }
        else
        {
            this._visitTreePath(targetFinal, rootNode, 0, item => {
                items.push(item);
            });
        }
        return items;
    }

    private _makeTarget(target: LogicTarget) : LogicTargetFinal
    {
        const result: LogicTargetFinal = {
            subtree: target.subtree ?? false,
            path: []
        }
        for(const x of target.path)
        {
            if (_.isString(x)) {
                result.path.push({
                    query: LogicTargetQuery.node,
                    kind: <NodeKind>x
                })
            }
            else {
                if (x.query == LogicTargetQuery.node)
                {
                    const xx = x as LogicTargetPathElement;
                    result.path.push(xx);
                }
                else if (x.query == LogicTargetQuery.link)
                {
                    const xx = x as LogicTargetLinkElement;
                    result.path.push(xx);
                }
            }
        }
        return result;
    }

    private _visitTreePath(logicTarget : LogicTargetFinal, item : LogicItem, index: number, cb : (item : LogicItem) => void)
    {
        this._logger.silly("[_visitTree] %s, path: %s...", item.dn);

        if (index >= logicTarget.path.length)
        {
            cb(item);
        }
        else
        {
            const filter = logicTarget.path[index];
            const children = this._findNextNodes(item, filter);
            for(const child of children)
            {
                this._visitTreePath(logicTarget, child, index + 1, cb);
            }
        }
    }

    private _findNextNodes(item : LogicItem, genericFilter: LogicFinalTargetType) : LogicItem[]
    {
        if (genericFilter.query == LogicTargetQuery.node)
        {
            const filter = genericFilter as LogicTargetPathElement;

            if (filter.descendents) {
                // TODO: Descendents by name not yet supported.
                return item.getDescendentsByKind(filter.kind);
            }

            if (filter.name)
            {
                const child = item.findByNaming(filter.kind, filter.name);
                if (child) {
                    return [ child ];
                }
                return [];
            }

            const children = item.getChildrenByKind(filter.kind);
            return children;
        }
        else if (genericFilter.query == LogicTargetQuery.link)
        {
            const filter = genericFilter as LogicTargetLinkElement;
            return item.resolveTargetLinkItems(filter.kind!);
        }
        
        return [];
    }

    private _visitTreeAll(item : LogicItem, cb : (item : LogicItem) => void)
    {
        this._logger.silly("[_visitTree] %s, path: %s...", item.dn);

        cb(item);

        const children = item.getChildren();
        for(const child of children)
        {
            this._visitTreeAll(child, cb);
        }
    }

    _recordAlert(item: LogicItem, alert: Alert)
    {
        this.logger.debug('[_recordAlert] %s => ', item.dn, alert);

        this._lastStageData.createdAlerts.push({ 
            item: item,
            alert: alert
        });
    }

    _acceptItem(item : LogicItem) 
    {
        this._lastStageData.createdItems.push(item);

        this._itemsMap[item.dn] = item;

        if (!this._itemKindMap[item.kind]) {
            this._itemKindMap[item.kind] = {};
        }
        this._itemKindMap[item.kind][item.dn] = item;
    }

    _dropItem(item : LogicItem) 
    {
        delete this._itemsMap[item.dn];
        delete this._itemKindMap[item.kind][item.dn];
    }

    extractItems() {
        return _.values(this._itemsMap);
    }

    findItem(dn : string) : LogicItem | null
    {
        const item = this._itemsMap[dn];
        if (!item) {
            return null;
        }
        return item;
    }
    
    extractCapacity()
    {
        let cap = [];
        for(const kind of _.keys(this._itemKindMap))
        {
            cap.push({
                kind: kind,
                count: _.keys(this._itemKindMap[kind]).length
            });
        }
        cap = _.orderBy(cap, ['count', 'kind'], ['desc', 'asc']);
        return cap;
    }

    debugOutputCapacity()
    {
        this.logger.info("[Scope] >>>>>>>");
        this.logger.info("[Scope] Total Count: %s", _.keys(this._itemsMap).length);

        const caps = this.extractCapacity();
        for(const x of caps)
        {
            this.logger.info("[Scope] %s :: %s", x.kind, x.count);
        }

        this.logger.info("[Scope] <<<<<<<");
    }
}


interface StageProcessingData
{
    createdItems: LogicItem[];
    createdAlerts: { item: LogicItem, alert: Alert }[];
}