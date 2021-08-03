import 'mocha';
import should = require('should');

import _ from 'the-lodash';

import { setupLogger, LoggerOptions } from 'the-logger';
const loggerOptions = new LoggerOptions().enableFile(false).pretty(true);
const logger = setupLogger('test', loggerOptions);

import { LogicProcessor } from '../src';
import { ProcessingTracker } from '@kubevious/helpers/dist/processing-tracker';
import { ConcreteRegistry } from './helpers/concrete-registry';

const tracker = new ProcessingTracker(logger);

describe('full-processor', () => {

    it('large-cluster', () => {
        const registry = new ConcreteRegistry(logger);

        return Promise.resolve()
            .then(() => registry.loadMockData('large-cluster'))
            .then(() => {
                registry.debugOutputCapacity();
                
                const logicProcessor = new LogicProcessor(logger, tracker, registry);
                return logicProcessor.process();
            })
            .then(registryState => {
                should(registryState).be.ok();

                {
                    const app = registryState.findByDn("root/ns-[kube-system]/app-[kube-dns]");
                    should(app).be.ok();
                }

                {
                    const cont = registryState.findByDn("root/ns-[kube-system]/app-[kube-dns]/cont-[kubedns]");
                    should(cont).be.ok();
                }

                {
                    const images = registryState.childrenByKind('root/ns-[kube-system]/app-[kube-dns]/cont-[kubedns]', 'image');
                    should(_.keys(images)).have.length(1);

                    const img = _.values(images)[0];
                    should(img).be.ok();

                    const props = img.getPropertiesConfig('properties');
                    should(props).be.ok();
                    should(props['name']).be.equal('k8s-dns-kube-dns-amd64');
                    should(props['repository']).be.equal('gke.gcr.io');
                }

                
            })
    })
    .timeout(20 * 1000)
    ;

});
