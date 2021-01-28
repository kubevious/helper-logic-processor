import 'mocha';
import should = require('should');

import { setupLogger, LoggerOptions } from 'the-logger';
const loggerOptions = new LoggerOptions().enableFile(false).pretty(true);
const logger = setupLogger('test', loggerOptions);

import { LogicProcessor } from '../src';
import { ProcessingTracker } from '@kubevious/helpers/dist/processing-tracker';
import { ConcreteRegistry } from './helpers/concrete-registry';

const tracker = new ProcessingTracker(logger);

describe('processor', () => {

    it('case-01', () => {
        const registry = new ConcreteRegistry();
        const logicProcessor = new LogicProcessor(logger, tracker, registry)
        return logicProcessor.process()
    });

});
