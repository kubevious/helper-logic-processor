import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicItem } from './item';
import { IConcreteRegistry, IConcreteItem } from '../types/registry';
import { LogicLinkRegistry } from '../logic/linker/registry';

import { Alert } from '@kubevious/helpers/dist/snapshot/types'

export const ROOT_NODE_LOGIC = 'root';
// export const ROOT_NODE_INFRA = 'infra';

export interface LogicTarget {
    path: (LogicTargetPathElement | string)[],
}

export interface LogicTargetFinal {
    path: LogicTargetPathElement[]
}

export interface LogicTargetPathElement {
    kind: string;
    name?: string;
}


export class LogicScope
{
    private _logger : ILogger;
    private _concreteRegistry : IConcreteRegistry;

    private _rootNodes : Record<string, LogicItem> = {};
    // private _root : LogicItem;
    private _itemsMap : Record<string, LogicItem> = {};
    private _itemKindMap : Record<string, Record<string, LogicItem> > = {};

    private _lastStageData : StageProcessingData = {
        createdItems: [],
        createdAlerts: []
    };

    private _linkRegistry : LogicLinkRegistry;

    constructor(logger: ILogger, concreteRegistry: IConcreteRegistry)
    {
        this._logger = logger.sublogger("LogicScope");
        this._concreteRegistry = concreteRegistry;

        this._linkRegistry = new LogicLinkRegistry(this);

        this._rootNodes[ROOT_NODE_LOGIC] = LogicItem.constructTop(this, ROOT_NODE_LOGIC);
        // this._rootNodes[ROOT_NODE_INFRA] = LogicItem.constructTop(this, ROOT_NODE_INFRA);
    }

    get logger() {
        return this._logger;
    }

    get concreteRegistry() {
        return this._concreteRegistry;
    }

    get rootNodes() {
        return _.values(this._rootNodes);
    }

    get logicRootNode() {
        return this._rootNodes[ROOT_NODE_LOGIC];
    }

    get linkRegistry() {
        return this._linkRegistry;
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

        let items : LogicItem[] = [];
        const rootNode = optionalRootNode ?? this.logicRootNode;
        if (targetFinal.path.length > 0)
        {
            this._visitTreePath(targetFinal, rootNode, 0, item => {
                items.push(item);
            });
        }
        else
        {
            this._visitTreeAll(rootNode, item => {
                items.push(item);
            });
        }
        return items;
    }

    private _makeTarget(target: LogicTarget) : LogicTargetFinal
    {
        const result: LogicTargetFinal = {
            path: target.path.map(x => {
                if (_.isString(x)) {
                    return {
                        kind: x
                    }
                } else {
                    return x;
                }
            })
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
            let filter = logicTarget.path[index];
            let children = this._findNextNodes(item, filter);
            for(let child of children)
            {
                this._visitTreePath(logicTarget, child, index + 1, cb);
            }
        }
    }

    private _findNextNodes(item : LogicItem, filter: LogicTargetPathElement) : LogicItem[]
    {
        if (filter.name)
        {
            const child = item.findByNaming(filter.kind, filter.name);
            if (child) {
                return [ child ];
            }
            return [];
        }

        let children = item.getChildrenByKind(filter.kind);
        return children;
    }

    private _visitTreeAll(item : LogicItem, cb : (item : LogicItem) => void)
    {
        this._logger.silly("[_visitTree] %s, path: %s...", item.dn);

        cb(item);

        let children = item.getChildren();
        for(let child of children)
        {
            this._visitTreeAll(child, cb);
        }
    }

    _recordAlert(item: LogicItem, alert: Alert)
    {
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
        let item = this._itemsMap[dn];
        if (!item) {
            return null;
        }
        return item;
    }
    
    extractCapacity()
    {
        let cap = [];
        for(let kind of _.keys(this._itemKindMap))
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
        for(let x of caps)
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