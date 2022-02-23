import 'mocha';
import should = require('should');

import _ from 'the-lodash';

import { makeLogger } from './helpers/logger';

import { ParserLoader, LogicProcessor } from '../src';
import { ProcessingTracker } from '@kubevious/helpers/dist/processing-tracker';
import { ConcreteRegistry } from './helpers/concrete-registry';

import { NodeKind } from '@kubevious/entity-meta';

const logger = makeLogger('full-proc');

const tracker = new ProcessingTracker(logger);

describe('full-processor', () => {

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

                // const registryLoggerOptions = new LoggerOptions().enableFile(true).cleanOnStart(true).pretty(true);
                // setupLogger('registry-logger', registryLoggerOptions);
                const registryLogger = makeLogger('registry-logger');

                return registryState.debugOutputToDir(registryLogger, 'large-cluster')
                    .then(() => {
                        const snapshotInfo = registryState.extractSnapshotInfo();
                        const contents = JSON.stringify(snapshotInfo, null, 4);
                        return registryLogger.outputFile("large-cluster-snapshot.json", contents);
                    })
                    .then(() => registryState);
            })
            .then(registryState => {

                {
                    const app = registryState.findByDn("root/logic/ns-[kube-system]/app-[kube-dns]");
                    should(app).be.ok();
                }

                {
                    const cont = registryState.findByDn("root/logic/ns-[kube-system]/app-[kube-dns]/cont-[kubedns]");
                    should(cont).be.ok();
                }

                {
                    const images = registryState.childrenByKind('root/logic/ns-[kube-system]/app-[kube-dns]/cont-[kubedns]', NodeKind.image);
                    should(_.keys(images)).have.length(1);

                    const img = _.values(images)[0];
                    should(img).be.ok();

                    const props = img.getPropertiesConfig('properties');
                    should(props).be.ok();
                    should(props['name']).be.equal('k8s-dns-kube-dns-amd64');
                    should(props['repository']).be.equal('gke.gcr.io');
                }

                {
                    // const app = registryState.findByDn("root/logic/ns-[marketing]/app-[github-stargazers-1645570800]/launcher-[Job]");
                    // should(app).be.ok();
                }


                {
                    // const app = registryState.findByDn("root/logic/ns-[marketing]/app-[github-stargazers]/launcher-[CronJob]");
                    // should(app).be.ok();
                }
                
            })
    })
    .timeout(30 * 1000)
    ;

});
