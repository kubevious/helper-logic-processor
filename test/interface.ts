import 'mocha';
import should = require('should');

import { makeLogger } from './helpers/logger';

import { ParserLoader, LogicProcessor } from '../src';
import { ProcessingTracker } from '@kubevious/helpers/dist/processing-tracker';
import { ConcreteRegistry } from './helpers/concrete-registry';

const logger = makeLogger('empty');

const tracker = new ProcessingTracker(logger);

describe('interface', () => {

    it('empty-registry', () => {
        const registry = new ConcreteRegistry(logger);
        registry.debugOutputCapacity();

        const parserLoader = new ParserLoader(logger);
        return Promise.resolve()
            .then(() => parserLoader.init())
            .then(() => {
                const logicProcessor = new LogicProcessor(logger, tracker, parserLoader, registry, {})
                return logicProcessor.process()
                    .then(registryState => {
                        should(registryState).be.ok();
                    })
            })
    })
    .timeout(20 * 1000)
    ;

});
