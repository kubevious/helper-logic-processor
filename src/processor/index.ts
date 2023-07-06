import _ from 'the-lodash';
import { ILogger } from 'the-logger';

import { LogicScope } from "../logic/scope";

import { Helpers } from '../helpers';
import { LogicItem } from '../logic/item';

import { BaseParserExecutor } from './base/executor';

import { ProcessingTrackerScoper } from '@kubevious/helper-backend';
import { RegistryState } from '@kubevious/state-registry';
import { SnapshotConfigKind, SnapshotItemInfo } from '@kubevious/state-registry';
import { ValidationConfig, DEFAULT_VALIDATION_CONFIG } from '@kubevious/entity-meta';

import { IConcreteRegistry } from '../types/registry';
import { ParserInfo, ParserLoader } from './parser-loader'

import { PersistenceStore } from '../store/presistence-store';
import { K8sConfig } from '../types/k8s';

export class LogicProcessor 
{
    private _logger : ILogger;
    private _parserLogger : ILogger;
    private _tracker: ProcessingTrackerScoper;
    private _registry : IConcreteRegistry;
    private _parserLoader : ParserLoader;
    private _validationConfig : ValidationConfig;

    private _processors : BaseParserExecutor[] = [];
    private _store : PersistenceStore;

    private _extraChanges : K8sConfig[] = [];

    constructor(logger: ILogger,
                tracker: ProcessingTrackerScoper,
                parserLoader: ParserLoader,
                registry: IConcreteRegistry,
                validationConfig: Partial<ValidationConfig>)
    {
        this._logger = logger.sublogger("LogicProcessor");
        this._parserLogger = logger.sublogger("LogicParser");
        this._tracker = tracker;
        this._registry = registry;
        this._parserLoader = parserLoader;
        this._validationConfig = _.defaults(_.clone(validationConfig), DEFAULT_VALIDATION_CONFIG) ;

        this._store = new PersistenceStore(logger.sublogger("LogicStore"));

        this._loadProcessors();
    }

    get logger() {
        return this._logger;
    }

    get parserLogger() {
        return this._parserLogger;
    }

    get store() {
        return this._store;
    }

    applyExtraChanges(changes: K8sConfig[])
    {
        this._extraChanges = changes;
    }

    process() : Promise<RegistryState>
    {
        return this._tracker.scope("Logic::process", (tracker) => {

            const scope = new LogicScope(
                this._logger,
                this._registry,
                this._store,
                this._validationConfig);

            const helpers = new Helpers(this._logger, scope);

            return Promise.resolve()
                .then(() => this._initializeHelpers(scope, helpers, tracker))
                .then(() => this._applyChanges(scope, helpers, tracker))
                .then(() => this._runLogic(scope, helpers, tracker))
                .then(() => this._dumpToFile(scope, helpers))
                .then(() => {
                    const items = scope.extractItems();
                    const state = this._makeRegistryState(items);
                    this._store.deleteMissingItems(state);
                    return state;
                })
                ;
        })
        .catch((reason : any) => {
            this._logger.error("[process] ", reason);
            throw reason;
        });
    }

    private _loadProcessors()
    {
        this.logger.info('[_loadProcessors]');

        let processors : BaseParserExecutor[] = [];

        for(const parserModuleInfo of this._parserLoader.parsers)
        {
            this._loadProcessor(parserModuleInfo, processors);
        }

        processors = _.orderBy(processors, [
            x => x.name,
            x => x.targetInfo
        ]);

        for(const processor of processors)
        {
            this._logger.info("[_extractProcessors] HANDLER: %s. Target: %s", 
                processor.name, 
                processor.targetInfo);

            this._processors.push(processor);
        }
    }

    private _loadProcessor(parserModuleInfo : ParserInfo, processors : BaseParserExecutor[])
    {
        const baseExecutors = parserModuleInfo.baseBuilder._extract(this._registry, this, parserModuleInfo.moduleName);

        for (const parserExecutor of baseExecutors)
        {
            processors.push(parserExecutor);
        }
    }

    private _initializeHelpers(scope : LogicScope, helpers: Helpers, tracker : ProcessingTrackerScoper)
    {
        helpers.k8s.apiRegistry.initialize(this._registry);
    }

    private _applyChanges(scope : LogicScope, helpers: Helpers, tracker : ProcessingTrackerScoper)
    {
        return tracker.scope("applyChanges", () => {

            for(const change of this._extraChanges)
            {
                const readyConfig = helpers.k8s.apiRegistry.postProcessConfig(change);
                this._registry.add(readyConfig);
            }

        })
    }

    private _runLogic(scope : LogicScope, helpers: Helpers, tracker : ProcessingTrackerScoper)
    {
        return tracker.scope("runLogic", () => {
            this._registry.debugOutputCapacity();

            this._processParsers(scope, helpers);
            this._propagate(scope);

            scope.debugOutputCapacity();
        })
    }

    private _processParsers(scope : LogicScope, helpers: Helpers)
    {
        for(const handlerInfo of this._processors)
        {
            this._processParser(scope, helpers, handlerInfo);
        }
    }

    private _processParser(scope: LogicScope, helpers: Helpers, handlerInfo : BaseParserExecutor)
    {
        this._logger.info("[_processParser] %s :: %s-Target: %s ", 
            handlerInfo.name,
            handlerInfo.kind,
            handlerInfo.targetInfo);

        handlerInfo.execute(scope, helpers);
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

        for(const flagInfo of node.getFlags())
        {
            if (flagInfo.propagatable)
            {
                node.parent.setFlag(flagInfo.name, flagInfo);
            }
        }
    }

    private _traverseTree(scope : LogicScope, cb : (item : LogicItem) => void)
    {
        const col : LogicItem[] = [ scope.logicRootNode ];
        while (col.length)
        {
            const node = col.shift()!;
            cb(node);
            col.unshift(...node.getChildren());
        }
    }

    private _traverseTreeBottomsUp(scope : LogicScope, cb : (item : LogicItem) => void)
    {
        const col : LogicItem[] = [];
        this._traverseTree(scope, x => {
            col.push(x);
        })

        for(let i = col.length - 1; i >= 0; i--)
        {
            const node = col[i];
            cb(node);
        }
    }

    private _dumpToFile(scope : LogicScope, helpers: Helpers)
    {
        return Promise.resolve()
                .then(() => {
                    return helpers.k8s.labelMatcher.dumpToFile();
                })
                .then(() => {
                    return helpers.k8s.ownerReferenceDict.dumpToFile();
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
        const snapshotItems : SnapshotItemInfo[] = [];

        for(const item of logicItems)
        {
            snapshotItems.push({
                dn: item.dn,
                kind: item.kind,
                config_kind: SnapshotConfigKind.node,
                config: item.exportNode()
            })

            const alerts = item.extractAlerts();
            if (alerts.length > 0) 
            {
                snapshotItems.push({
                    dn: item.dn,
                    kind: item.kind,
                    config_kind: SnapshotConfigKind.alerts,
                    config: alerts
                })
            }

            const properties = item.extractProperties();
            for(const props of properties)
            {
                snapshotItems.push({
                    dn: item.dn,
                    kind: item.kind,
                    config_kind: SnapshotConfigKind.props,
                    config: props
                })
            }
        }

        const registryState = new RegistryState({
            date: this._registry.date,
            items: snapshotItems
        })
        return registryState;
    }

}

