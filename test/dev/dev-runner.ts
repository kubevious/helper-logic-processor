import 'mocha';
import should = require('should');
import * as Path from 'path';

import _ from 'the-lodash';

import { makeLogger } from '../helpers/logger';

import { ParserLoader, LogicProcessor, K8sConfig } from '../../src';
import { TimerScheduler } from '@kubevious/helper-backend/dist/timer-scheduler';
import { ProcessingTracker } from '@kubevious/helper-backend/dist/processing-tracker';
import { ConcreteRegistry } from '../helpers/concrete-registry';
import { saveJson, tryLoadJson, loadYaml } from '../helpers/file-system';
import { PersistenceItem } from '../../src/store/presistence-store';

const logger = makeLogger('dev-runner');

const tracker = new ProcessingTracker(logger, new TimerScheduler(logger));

describe('dev-runner', () => {

    it('large-cluster', () => {
        const registry = new ConcreteRegistry(logger);

        const LogicStorePath = Path.resolve(__dirname, '..', '..', 'runtime', 'logic-store.json');

        const currentStoreItems : PersistenceItem[] = tryLoadJson(LogicStorePath) ?? [];

        const extraChanges : K8sConfig[] = [];
        {
            const guardChangesPath = Path.resolve(__dirname, '..', '..', 'mock-data', 'guard-changes');
            extraChanges.push(loadYaml(Path.resolve(guardChangesPath, 'nginx-no-ns.yaml')) as K8sConfig);
            extraChanges.push(loadYaml(Path.resolve(guardChangesPath, 'nginx-with-ns.yaml')) as K8sConfig);
        }

        return Promise.resolve()
            .then(() => registry.loadMockData('large-cluster'))
            .then(() => {
                registry.debugOutputCapacity();

                const parserLoader = new ParserLoader(logger);
                return Promise.resolve()
                    .then(() => parserLoader.init())
                    .then(() => {
                        const logicProcessor = new LogicProcessor(logger, tracker, parserLoader, registry, {});
                        logicProcessor.store.loadItems(currentStoreItems);

                        logicProcessor.applyExtraChanges(extraChanges);

                        return logicProcessor.process()
                            .then(registryState => {
                                const storeItems = logicProcessor.store.exportItems();

                                saveJson(LogicStorePath, storeItems);

                                return registryState;
                            })
                    })
            })
            .then(registryState => {
                should(registryState).be.ok();

                const registryLogger = makeLogger('registry-logger');

                return registryState.debugOutputToDir(registryLogger, 'large-cluster')
                    .then(() => {
                        const snapshotInfo = registryState.extractSnapshotInfo();
                        const contents = JSON.stringify(snapshotInfo, null, 4);
                        return registryLogger.outputFile("large-cluster-snapshot.json", contents);
                    })
                    .then(() => registryState);
            })
    })
    .timeout(60 * 1000)
    ;

});
