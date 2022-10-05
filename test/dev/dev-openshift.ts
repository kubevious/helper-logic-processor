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

import { getMockPath } from '../helpers/mock';

const logger = makeLogger('dev-runner');

const tracker = new ProcessingTracker(logger, new TimerScheduler(logger));

describe('dev-runner', () => {

    it('openshift-cluster', () => {
        const registry = new ConcreteRegistry(logger);

        const LogicStorePath = Path.resolve(__dirname, '..', '..', 'runtime', 'logic-store.json');

        const currentStoreItems : PersistenceItem[] = tryLoadJson(LogicStorePath) ?? [];


        return Promise.resolve()
            .then(() => registry.loadMockData('openshift'))
            .then(() => {
                registry.debugOutputCapacity();

                const parserLoader = new ParserLoader(logger);
                return Promise.resolve()
                    .then(() => parserLoader.init())
                    .then(() => {
                        const logicProcessor = new LogicProcessor(logger, tracker, parserLoader, registry, {});
                        logicProcessor.store.loadItems(currentStoreItems);

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

                return registryState.debugOutputToDir(registryLogger, 'openshift')
                    .then(() => {
                        const snapshotInfo = registryState.extractSnapshotInfo();
                        const contents = JSON.stringify(snapshotInfo, null, 4);
                        return registryLogger.outputFile("openshift-snapshot.json", contents);
                    })
                    .then(() => registryState);
            })
    })
    .timeout(60 * 1000)
    ;

});
