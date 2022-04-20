import 'mocha';
import should = require('should');

import _ from 'the-lodash';

import { makeLogger } from '../helpers/logger';

import { ParserLoader, LogicProcessor } from '../../src';
import { TimerScheduler } from '@kubevious/helper-backend/dist/timer-scheduler';
import { ProcessingTracker } from '@kubevious/helper-backend/dist/processing-tracker';
import { ConcreteRegistry } from '../helpers/concrete-registry';

const logger = makeLogger('dev-runner');

const tracker = new ProcessingTracker(logger, new TimerScheduler(logger));

describe('dev-runner', () => {

    it('large-cluster', () => {
        const registry = new ConcreteRegistry(logger);

        return Promise.resolve()
            .then(() => registry.loadMockData('large-cluster'))
            .then(() => {
                registry.debugOutputCapacity();

                const parserLoader = new ParserLoader(logger);
                return Promise.resolve()
                    .then(() => parserLoader.init())
                    .then(() => {
                        const logicProcessor = new LogicProcessor(logger, tracker, parserLoader, registry, {});
                        return logicProcessor.process();
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
    .timeout(30 * 1000)
    ;

});
