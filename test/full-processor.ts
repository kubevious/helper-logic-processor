import 'mocha';
import should = require('should');
import * as Path from 'path';

import _ from 'the-lodash';

import { makeLogger } from './helpers/logger';

import { ParserLoader, LogicProcessor, K8sConfig } from '../src';
import { TimerScheduler } from '@kubevious/helper-backend/dist/timer-scheduler';
import { ProcessingTracker } from '@kubevious/helper-backend/dist/processing-tracker';
import { ConcreteRegistry } from './helpers/concrete-registry';

import { NodeKind, PropsId } from '@kubevious/entity-meta';
import { loadYaml } from './helpers/file-system';

import { getMockPath } from './helpers/mock';

const logger = makeLogger('full-proc');

const tracker = new ProcessingTracker(logger, new TimerScheduler(logger));

describe('full-processor', () => {

    it('large-cluster', () => {
        const registry = new ConcreteRegistry(logger);

        return Promise.resolve()
            .then(() => registry.loadMockData('large-cluster-mock'))
            .then(() => {
                registry.debugOutputCapacity();

                const parserLoader = new ParserLoader(logger);
                return Promise.resolve()
                    .then(() => parserLoader.init())
                    .then(() => {

                        const extraChanges : K8sConfig[] = [];
                        {
                            const guardChangesPath = getMockPath('guard-changes');
                            extraChanges.push(loadYaml(Path.resolve(guardChangesPath, 'nginx-no-ns.yaml')) as K8sConfig);
                            extraChanges.push(loadYaml(Path.resolve(guardChangesPath, 'nginx-with-ns.yaml')) as K8sConfig);
                        }
                        
                        const logicProcessor = new LogicProcessor(logger, tracker, parserLoader, registry, {});

                        logicProcessor.applyExtraChanges(extraChanges);

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

                    const imgDn = _.values(images)[0];
                    should(imgDn).be.ok();

                    const props = registryState.getProperties(imgDn, PropsId.properties);
                    const propsConfig = props.config;
                    should(propsConfig).be.ok();
                    should(propsConfig['name']).be.equal('k8s-dns-kube-dns-amd64');
                    should(propsConfig['repository']).be.equal('gke.gcr.io');
                }

                {
                    const app = registryState.findByDn("root/k8s/ns-[default]/api-[apps]/version-[v1]/kind-[Deployment]/resource-[nginx]");
                    should(app).be.ok();
                }

                {
                    const app = registryState.findByDn("root/k8s/ns-[sample]/api-[apps]/version-[v1]/kind-[Deployment]/resource-[nginx-good]");
                    should(app).be.ok();
                }
                
            })
    })
    .timeout(30 * 1000)
    ;

    it('openshift', () => {
        const registry = new ConcreteRegistry(logger);

        return Promise.resolve()
            .then(() => registry.loadMockData('openshift'))
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

                return registryState.debugOutputToDir(registryLogger, 'openshift')
                    .then(() => {
                        const snapshotInfo = registryState.extractSnapshotInfo();
                        const contents = JSON.stringify(snapshotInfo, null, 4);
                        return registryLogger.outputFile("openshift-snapshot.json", contents);
                    })
                    .then(() => registryState);
            })
            .then(registryState => {

                {
                    const app = registryState.findByDn("root/logic/ns-[kube-system]");
                    should(app).be.ok();
                }
                
            })
    })
    .timeout(30 * 1000)
    ;

});
