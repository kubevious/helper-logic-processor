import 'mocha';
import should = require('should');

import _ from 'the-lodash';

import { setupLogger, LoggerOptions } from 'the-logger';
const loggerOptions = new LoggerOptions().enableFile(false).pretty(true);
const logger = setupLogger('test', loggerOptions);

import { extractK8sConfigId } from '../src';
import { getMockPath } from './helpers/mock';
import * as fs from 'fs';

const yaml = require('js-yaml');


describe('extractK8sConfigId', () => {

    it('extractK8sConfigId-01', () => {

        const filePath = getMockPath('large-cluster-mock/k8s/v1:Node/gke-kubevious-samples-pool-2-d17eaa99-a7xj.yaml');

        const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));

        const id = extractK8sConfigId(doc);

        should(id).be.eql({
            "infra": "k8s",
            "api": "v1",
            "apiName": null,
            "version": "v1",
            "kind": "Node",
            "name": "gke-kubevious-samples-pool-2-d17eaa99-a7xj"
        })

    })
    ;

});
