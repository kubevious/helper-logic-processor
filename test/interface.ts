import 'mocha';
import should = require('should');

import { setupLogger, LoggerOptions } from 'the-logger';
const loggerOptions = new LoggerOptions().enableFile(false).pretty(true);
const logger = setupLogger('test', loggerOptions);

import { ParserLoader, LogicProcessor } from '../src';
import { ProcessingTracker } from '@kubevious/helpers/dist/processing-tracker';
import { ConcreteRegistry } from './helpers/concrete-registry';

const tracker = new ProcessingTracker(logger);

describe('interface', () => {

    it('empty-registry', () => {
        const registry = new ConcreteRegistry(logger);
        registry.debugOutputCapacity();

        const parserLoader = new ParserLoader(logger);
        return Promise.resolve()
            .then(() => parserLoader.init())
            .then(() => {
                const logicProcessor = new LogicProcessor(logger, tracker, parserLoader, registry)
                return logicProcessor.process()
                    .then(registryState => {
                        should(registryState).be.ok();
                    })
            })
    })
    .timeout(20 * 1000)
    ;

});
