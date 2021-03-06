import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { InfraScope } from './infra';
import { NamespaceScope } from './namespace';
import { LogicItem } from '../item';
import { LabelMatcher } from './label-matcher';
import { IConcreteRegistry, IConcreteItem } from '../registry';

export class LogicScope
{
    private _logger : ILogger;
    private _concreteRegistry : IConcreteRegistry;

    private _root : LogicItem;
    private _itemsMap : Record<string, LogicItem> = {};
    private _itemKindMap : Record<string, Record<string, LogicItem> > = {};

    private _namespaceScopes : Record<string, NamespaceScope> = {};
    private _infraScope : InfraScope;

    private _namespaceLabelMatcher : LabelMatcher<NamespaceScope>;

    constructor(logger: ILogger, concreteRegistry: IConcreteRegistry)
    {
        this._logger = logger.sublogger("LogicScope");
        this._concreteRegistry = concreteRegistry;

        this._root = LogicItem.constructTop(this);

        this._namespaceScopes = {};
        this._infraScope = new InfraScope(this);

        this._namespaceLabelMatcher = new LabelMatcher();
    }

    get logger() {
        return this._logger;
    }

    get concreteRegistry() {
        return this._concreteRegistry;
    }

    get root() {
        return this._root;
    }

    _acceptItem(item : LogicItem) 
    {
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
        let namespaceScope = this.getNamespaceScope(name);
        this._namespaceLabelMatcher.register(labelsMap, namespaceScope);
    }

    findNamespaceScopesByLabels(selector : Record<string, any>) : NamespaceScope[]
    {
        return this._namespaceLabelMatcher.match(selector);
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
            var labels = _.get(config, 'metadata.labels');
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
            var annotations = _.get(config, 'metadata.annotations');
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

    _normalizeDict(dict : Record<string, any>) : Record<string, any>
    {
        dict = dict || {};

        let res : Record<string, any> = {};
        for(var key of _.sortBy(_.keys(dict)))
        {
            res[key] = dict[key];
        }
        return res;
    }

    fetchInfraRawContainer() : LogicItem
    {
        let infra = this.root.fetchByNaming("infra", "Infrastructure");
        infra.order = 1000;
        return infra;
    }

    fetchRawContainer(item : IConcreteItem, name : string) : LogicItem
    {
        var nsName = item.config.metadata.namespace;
        return this.fetchNamespaceRawContainer(nsName, name)
    }

    fetchNamespaceRawContainer(nsName : string, name : string) : LogicItem
    {
        var namespace = this.root.fetchByNaming("ns", nsName);
        var rawContainer = namespace.fetchByNaming("raw", "Raw Configs");
        rawContainer.order = 1000;
        var container = rawContainer.fetchByNaming("raw", name);
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

    _findItem(itemPath : { kind: string, name: string}[]) : LogicItem | null
    {
        let item = this.root;
        for(var x of itemPath) {
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
        var cap = [];
        for(var kind of _.keys(this._itemKindMap))
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
