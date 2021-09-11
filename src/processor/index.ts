import _ from 'the-lodash';
import { Promise } from 'the-promise';
import { ILogger } from 'the-logger';

import { LogicScope } from "../logic/scope";

import { Helpers } from '../helpers';
import { LogicItem } from '../logic/item';

import { BaseParserExecutor } from './base/executor';

import { ProcessingTrackerScoper } from '@kubevious/helpers/dist/processing-tracker';
import { RegistryState } from '@kubevious/helpers/dist/registry-state';

import { IConcreteRegistry } from '../types/registry';
import { SnapshotConfigKind, SnapshotItemInfo } from '@kubevious/helpers/dist/snapshot/types';
import { ParserInfo, ParserLoader } from './parser-loader'

export class LogicProcessor 
{
    private _logger : ILogger;
    private _parserLogger : ILogger;
    private _tracker: ProcessingTrackerScoper;
    private _registry : IConcreteRegistry;
    private _parserLoader : ParserLoader;

    private _helpers : Helpers;
    private _processors : BaseParserExecutor[] = [];

    constructor(logger: ILogger, tracker: ProcessingTrackerScoper, parserLoader: ParserLoader, registry : IConcreteRegistry)
    {
        this._logger = logger.sublogger("LogicProcessor");
        this._parserLogger = logger.sublogger("LogicParser");
        this._tracker = tracker;
        this._registry = registry;
        this._parserLoader = parserLoader;

        this._helpers = new Helpers(this._logger);

        this._loadProcessors();
    }

    get logger() {
        return this._logger;
    }

    get parserLogger() {
        return this._parserLogger;
    }

    get helpers() : Helpers {
        return this._helpers;
    }

    private _loadProcessors()
    {
        this.logger.info('[_loadProcessors]');

        let processors : BaseParserExecutor[] = [];

        for(let parserModuleInfo of this._parserLoader.parsers)
        {
            this._loadProcessor(parserModuleInfo, processors);
        }

        processors = _.orderBy(processors, [
            x => x.name,
            x => x.targetInfo
        ]);

        for(let processor of processors)
        {
            this._logger.info("[_extractProcessors] HANDLER: %s. Target: %s", 
                processor.name, 
                processor.targetInfo);

            this._processors.push(processor);
        }
    }

    private _loadProcessor(parserModuleInfo : ParserInfo, processors : BaseParserExecutor[])
    {
        let baseExecutors = parserModuleInfo.baseBuilder._extract(this._registry, this, parserModuleInfo.moduleName);

        for (let parserExecutor of baseExecutors)
        {
            processors.push(parserExecutor);
        }
    }

    process() : Promise<RegistryState>
    {
        return this._tracker.scope("Logic::process", (tracker) => {

            let scope = new LogicScope(this._logger, this._registry);

            return Promise.resolve()
                .then(() => this._runLogic(scope, tracker))
                .then(() => this._dumpToFile(scope))
                .then(() => {
                    let items = scope.extractItems();
                    let state = this._makeRegistryState(items);
                    return state;
                })
                ;
        })
        .catch((reason : any) => {
            this._logger.error("[process] ", reason);
            throw reason;
        });
    }

    private _runLogic(scope : LogicScope, tracker : any)
    {
        return tracker.scope("runLogic", () => {
            this._registry.debugOutputCapacity();

            this._processParsers(scope);
            this._finalizeScope(scope);
            this._propagate(scope);

            scope.debugOutputCapacity();
        })
    }

    private _processParsers(scope : LogicScope)
    {
        for(let handlerInfo of this._processors)
        {
            this._processParser(scope, handlerInfo);
        }
    }

    private _processParser(scope: LogicScope, handlerInfo : BaseParserExecutor)
    {
        this._logger.info("[_processParser] %s :: %s-Target: %s ", 
            handlerInfo.name,
            handlerInfo.kind,
            handlerInfo.targetInfo);

        handlerInfo.execute(scope);

    //     } else if (handlerInfo.targetKind == 'scope') {
    //         if (handlerInfo.target.namespaced) {
    //             let items = scope.getNamespaceScopes();
    //             if (handlerInfo.target.scopeKind) {
    //                 items = _.flatten(items.map(x => x.items.getAll(handlerInfo.target.scopeKind)))
    //                 targets = items.map(x => ({ id: 'scope-item-' + x.kind + '-' + x.name, itemScope: x, item: x }));
    //             } else {
    //                 targets = items.map(x => ({ id: 'scope-ns-' + x.name, namespaceScope: x, item: x }));
    //             }
    //         } else {
    //             let items = scope.getInfraScope().items.getAll(handlerInfo.target.scopeKind);
    //             targets = items.map(x => ({ id: 'scope-item-' + x.kind + '-' + x.name, itemScope: x, item: x }));
    //         }
    //     }
    }

    private _finalizeScope(scope : LogicScope)
    {
        // scope.getInfraScope().items.finalize();
        // for(let nsScope of scope.getNamespaceScopes())
        // {
        //     nsScope.items.finalize();
        // }
    }

    private _propagate(scope : LogicScope)
    {
        this._traverseTreeBottomsUp(scope, this._propagateFlags.bind(this));
    }

    private _propagateFlags(node : LogicItem)
    {
        this.logger.silly("[_propagateFlags] %s...", node.dn)

        if (!node.parent) {
            return;
        }

        for(let flagInfo of node.getFlags())
        {
            if (flagInfo.propagatable)
            {
                node.parent.setFlag(flagInfo.name, flagInfo);
            }
        }
    }

    private _traverseTree(scope : LogicScope, cb : (item : LogicItem) => void)
    {
        let col : LogicItem[] = [ scope.logicRootNode ]; // scope.rootNodes;
        while (col.length)
        {
            let node = col.shift()!;
            cb(node);
            col.unshift(...node.getChildren());
        }
    }

    private _traverseTreeBottomsUp(scope : LogicScope, cb : (item : LogicItem) => void)
    {
        let col : LogicItem[] = [];
        this._traverseTree(scope, x => {
            col.push(x);
        })

        for(let i = col.length - 1; i >= 0; i--)
        {
            let node = col[i];
            cb(node);
        }
    }

    private _dumpToFile(scope : LogicScope)
    {
        return Promise.resolve()
                .then(() => {
                    return this._helpers.k8s.labelMatcher.dumpToFile();
                })
            // .then(() => {
            //     let writer = this.logger.outputStream("dump-logic-tree");
            //     if (writer) {
            //         scope.root.debugOutputToFile(writer);
            //         return writer.close();
            //     }
            // })
            // .then(() => {
            //     let writer = this.logger.outputStream("dump-logic-tree-detailed");
            //     if (writer) {
            //         scope.root.debugOutputToFile(writer, { includeConfig: true });
            //         return writer.close();
            //     }
            // })
    }

    private _makeRegistryState(logicItems: LogicItem[]) : RegistryState
    {
        let snapshotItems : SnapshotItemInfo[] = [];

        for(let item of logicItems)
        {
            snapshotItems.push({
                dn: item.dn,
                kind: item.kind,
                config_kind: SnapshotConfigKind.node,
                config: item.exportNode()
            })

            let alerts = item.extractAlerts();
            if (alerts.length > 0) 
            {
                snapshotItems.push({
                    dn: item.dn,
                    kind: item.kind,
                    config_kind: SnapshotConfigKind.alerts,
                    config: alerts
                })
            }

            let properties = item.extractProperties();
            for(let props of properties)
            {
                snapshotItems.push({
                    dn: item.dn,
                    kind: item.kind,
                    config_kind: SnapshotConfigKind.props,
                    config: props
                })
            }
        }

        let registryState = new RegistryState({
            date: this._registry.date,
            items: snapshotItems
        })
        return registryState;
    }

}

