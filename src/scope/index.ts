import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { InfraScope } from './infra';
import { NamespaceScope } from './namespace';
import { LogicItem } from '../item';
// import { LabelMatcher } from './label-matcher';
import { IConcreteRegistry, IConcreteItem } from '../types/registry';
import { LogicLinkRegistry } from '../logic/linker/registry';

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

    private _namespaceScopes : Record<string, NamespaceScope> = {};
    private _infraScope : InfraScope;

    private _lastStageItems : LogicItem[] = [];

    private _linkRegistry : LogicLinkRegistry;

    // private _namespaceLabelMatcher : LabelMatcher<NamespaceScope>;

    constructor(logger: ILogger, concreteRegistry: IConcreteRegistry)
    {
        this._logger = logger.sublogger("LogicScope");
        this._concreteRegistry = concreteRegistry;

        this._linkRegistry = new LogicLinkRegistry(this);

        this._rootNodes[ROOT_NODE_LOGIC] = LogicItem.constructTop(this, ROOT_NODE_LOGIC);
        // this._rootNodes[ROOT_NODE_INFRA] = LogicItem.constructTop(this, ROOT_NODE_INFRA);

        this._namespaceScopes = {};
        this._infraScope = new InfraScope(this);


        // this._namespaceLabelMatcher = new LabelMatcher();
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

    // get infraRootNode() {
    //     return this._rootNodes[ROOT_NODE_INFRA];
    // }

    extractLastedStageItems() {
        const list = this._lastStageItems;
        this._lastStageItems = [];
        return list;
    }

    countItemsByPath(logicTarget : LogicTarget) : number
    {
        return this.findItemsByPath(logicTarget).length;
    }

    findItemsByPath(logicTarget : LogicTarget) : LogicItem[]
    {
        const targetFinal = this._makeTarget(logicTarget);

        let items : LogicItem[] = [];
        const rootNode = this.logicRootNode;
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

    _acceptItem(item : LogicItem) 
    {
        this._lastStageItems.push(item);

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
    
    getInfraScope() {
        return this._infraScope;
    }

    getNamespaceScope(name : string) {
        if (!this._namespaceScopes[name]) {
            this._namespaceScopes[name] = new NamespaceScope(this, name);
        }
        return this._namespaceScopes[name];
    }

    getNamespaceScopes() {
        return _.values(this._namespaceScopes);
    }
    
    registerNamespaceLabels(name: string, labelsMap : Record<string, any>)
    {
        // let namespaceScope = this.getNamespaceScope(name);
        // this._namespaceLabelMatcher.register(labelsMap, namespaceScope);
    }

    findNamespaceScopesByLabels(selector : Record<string, any>) : NamespaceScope[]
    {
        // return this._namespaceLabelMatcher.match(selector);
        return [];
    }

    setK8sConfig(logicItem : LogicItem, config : any)
    {
        {
            logicItem.setConfig(config);
            logicItem.addProperties({
                kind: "yaml",
                id: "config",
                title: "Config",
                order: 10,
                config: config
            });
        }

        {
            let labels = _.get(config, 'metadata.labels');
            labels = this._normalizeDict(labels);
            logicItem.addProperties({
                kind: "key-value",
                id: "labels",
                title: "Labels",
                order: 8,
                config: labels
            });
        }

        {
            let annotations = _.get(config, 'metadata.annotations');
            annotations = this._normalizeDict(annotations);
            logicItem.addProperties({
                kind: "key-value",
                id: "annotations",
                title: "Annotations",
                order: 9,
                config: annotations
            });
        }
    }

    private _normalizeDict(dict : Record<string, any>) : Record<string, any>
    {
        dict = dict || {};

        let res : Record<string, any> = {};
        for(let key of _.sortBy(_.keys(dict)))
        {
            res[key] = dict[key];
        }
        return res;
    }

    fetchInfraRawContainer() : LogicItem
    {
        let infra = this.logicRootNode.fetchByNaming("infra", "Infrastructure");
        infra.order = 1000;
        return infra;
    }

    fetchRawContainer(item : IConcreteItem, name : string) : LogicItem
    {
        let nsName = item.config.metadata.namespace!;
        return this.fetchNamespaceRawContainer(nsName, name)
    }

    fetchNamespaceRawContainer(nsName : string, name : string) : LogicItem
    {
        let namespace = this.logicRootNode.fetchByNaming("ns", nsName);
        let rawContainer = namespace.fetchByNaming("raw", "Raw Configs");
        rawContainer.order = 1000;
        let container = rawContainer.fetchByNaming("raw", name);
        return container;
    }
    
    findAppItem(namespace : string, name : string) : LogicItem | null
    {
        return this._findItem([
            {
                kind: "ns",
                name: namespace
            },
            {
                kind: "app",
                name: name
            }
        ]);
    }

    private _findItem(itemPath : { kind: string, name: string}[]) : LogicItem | null
    {
        let item = this.logicRootNode;
        for(let x of itemPath) {
            let next = item.findByNaming(x.kind, x.name);
            if (!item) {
                return null;
            }
            item = next!;
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
