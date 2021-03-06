import _ from 'the-lodash';
import { Promise } from 'the-promise';
import { ILogger } from 'the-logger';

import { readdirSync } from 'fs' 
import * as path from 'path' 

import { LogicScope } from "../scope";

import { Helpers } from '../helpers';
import { LogicItem } from '../item';

import { BaseParserBuilder } from './base/builder'
import { ConcreteParserInfo } from './concrete/builder'
import { LogicParserInfo } from './logic/builder'
import { ScopeParserInfo } from './scope/builder';

import { BaseParserExecutor } from './base/executor';
import { ConcreteParserExecutor } from './concrete/executor';
import { LogicParserExecutor } from './logic/executor';
import { ScopeParserExecutor } from './scope/executor';

import { ProcessingTrackerScoper } from '@kubevious/helpers/dist/processing-tracker';
import { RegistryState } from '@kubevious/helpers/dist/registry-state';

import { IConcreteRegistry } from '../registry';
import { SnapshotConfigKind, SnapshotItemInfo } from '@kubevious/helpers/dist/snapshot/types';

export class LogicProcessor 
{
    private _logger : ILogger;
    private _tracker: ProcessingTrackerScoper;
    private _registry : IConcreteRegistry;

    private _helpers : Helpers = new Helpers();
    private _processors : BaseParserExecutor[] = [];

    constructor(logger: ILogger, tracker: ProcessingTrackerScoper, registry : IConcreteRegistry)
    {
        this._logger = logger.sublogger("LogicProcessor");
        this._tracker = tracker;
        this._registry = registry;

        this._extractProcessors('parsers');
        this._extractProcessors('polishers');
    }

    get logger() {
        return this._logger;
    }

    get helpers() : Helpers {
        return this._helpers;
    }

    private _extractProcessors(location : string)
    {
        this.logger.info('[_extractProcessors] location: %s', location);
        let searchPath = path.resolve(__dirname, '..', location);
        this.logger.debug('[_extractProcessors] search path: %s', searchPath);
        let files : string[] = readdirSync(searchPath);
        files = _.filter(files, x => x.endsWith('.d.ts'));

        let processors : BaseParserExecutor[] = [];

        for(let fileName of files)
        {
            this.logger.debug('[_extractProcessors] %s', fileName);
            let moduleName = fileName.replace('.d.ts', '');
            this._loadProcessor(moduleName, location, processors);
        }

        processors = _.orderBy(processors, [
            x => x.order,
            x => x.name,
            x => x.targetInfo
        ]);

        for(let processor of processors)
        {
            this._logger.info("[_extractProcessors] HANDLER: %s -> %s, target:", 
                processor.order, 
                processor.name);

            this._processors.push(processor);
        }

    }

    private _loadProcessor(name : string, location : string, processors : BaseParserExecutor[])
    {
        this.logger.info('[_loadProcessor] %s...', name);

        const moduleName = location + '/' + name;
        const modulePath = '../' + moduleName;
        const parserModule = require(modulePath);

        let defaultExport = parserModule.default;
        if (!defaultExport) {
            this.logger.error("Invalid Parser: %s", modulePath);
            throw new Error("Invalid Parser: " + modulePath);
            return;
        }

        let baseParserBuilder = <BaseParserBuilder>defaultExport;
        let baseParserInfos = baseParserBuilder._extract();

        for (let baseParserInfo of baseParserInfos)
        {
            if (baseParserInfo.targetKind == 'concrete')
            {
                let parserInfo = <ConcreteParserInfo>baseParserInfo;
                let parserExecutor = new ConcreteParserExecutor(
                    this._registry,
                    this,
                    moduleName,
                    parserInfo)
                processors.push(parserExecutor);
            }
            else if (baseParserInfo.targetKind == 'logic')
            {
                let parserInfo = <LogicParserInfo>baseParserInfo;
                let parserExecutor = new LogicParserExecutor(
                    this,
                    moduleName,
                    parserInfo)
                processors.push(parserExecutor);
            }
            else if (baseParserInfo.targetKind == 'scope')
            {
                let parserInfo = <ScopeParserInfo>baseParserInfo;
                let parserExecutor = new ScopeParserExecutor(
                    this,
                    moduleName,
                    parserInfo)
                processors.push(parserExecutor);
            }
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
            this._propagete(scope);

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
        this._logger.debug("[_processParser] Handler: %s -> %s, target: %s :: ", 
            handlerInfo.order,
            handlerInfo.name);

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
        scope.getInfraScope().items.finalize();
        for(let nsScope of scope.getNamespaceScopes())
        {
            nsScope.items.finalize();
        }
    }

    _propagete(scope : LogicScope)
    {
        this._traverseTreeBottomsUp(scope, this._propagateFlags.bind(this));
    }

    _propagateFlags(node : LogicItem)
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

    _traverseTree(scope : LogicScope, cb : (item : LogicItem) => void)
    {
        let col : LogicItem[] = [scope.root];
        while (col.length)
        {
            let node = col.shift()!;
            cb(node);
            col.unshift(...node.getChildren());
        }
    }

    _traverseTreeBottomsUp(scope : LogicScope, cb : (item : LogicItem) => void)
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

    _dumpToFile(scope : LogicScope)
    {
        return Promise.resolve()
            .then(() => {
                let writer = this.logger.outputStream("dump-logic-tree");
                if (writer) {
                    scope.root.debugOutputToFile(writer);
                    return writer.close();
                }
            })
            .then(() => {
                let writer = this.logger.outputStream("dump-logic-tree-detailed");
                if (writer) {
                    scope.root.debugOutputToFile(writer, { includeConfig: true });
                    return writer.close();
                }
            })
            // .then(() => {
            //     let writer = this.logger.outputStream("exported-tree");
            //     if (writer) {
            //         writer.write(this._context.facadeRegistry.logicTree);
            //         return writer.close();
            //     }
            // });
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
                    config: item.extractAlerts()
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

