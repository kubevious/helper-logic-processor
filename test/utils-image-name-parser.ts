import 'mocha';
import should = require('should');
import { parseImageString, splitImageTag, splitRepo } from '../src/utils/image-naming';

import { makeLogger } from './helpers/logger';

const logger = makeLogger('empty');

describe('image-name-parser', () => {

    it('splitImageTag-01', () => {
      
        const result = splitImageTag('minio/minio:RELEASE.2017-12-28T01-21-00Z');

        should(result).be.ok();
        should(result).be.eql({
            imagePath: "minio/minio",
            tag: "RELEASE.2017-12-28T01-21-00Z"
        })
        
    })
    ;

    it('splitImageTag-02', () => {
      
        const result = splitImageTag('minio:1234/minio:v123');

        should(result).be.ok();
        should(result).be.eql({
            imagePath: "minio:1234/minio",
            tag: "v123"
        })
        
    })
    ;

    it('splitImageTag-03', () => {
      
        const result = splitImageTag('minio:1234/minio');

        should(result).be.ok();
        should(result).be.eql({
            imagePath: "minio:1234/minio",
            tag: "latest"
        })
        
    })
    ;



    it('splitRepo-01', () => {
      
        const result = splitRepo('minio/minio');

        should(result).be.ok();
        should(result).be.eql({
            repo: 'dockerhub',
            path: 'minio/minio'
        })
        
    })
    ;

    it('splitRepo-02', () => {
      
        const result = splitRepo('gcr.io:1234/google-samples/microservices-demo/productcatalogservice');

        should(result).be.ok();
        should(result).be.eql({
            repo: 'gcr.io:1234',
            path: 'google-samples/microservices-demo/productcatalogservice'
        })
        
    })
    ;

    it('splitRepo-03', () => {
      
        const result = splitRepo('nginx');

        should(result).be.ok();
        should(result).be.eql({
            repo: 'dockerhub',
            path: 'nginx'
        })
        
    })
    ;


    /* FULL PARSER */
    it('parseImageString-01', () => {
      
        const result = parseImageString('minio/minio:RELEASE.2017-12-28T01-21-00Z');

        should(result).be.ok();
        should(result).be.eql({
            fullImage: 'minio/minio:RELEASE.2017-12-28T01-21-00Z',
            imagePath: 'minio/minio',
            repository: 'dockerhub',
            name: 'minio/minio',
            tag: 'RELEASE.2017-12-28T01-21-00Z'
        })
        
    })
    ;

    it('parseImageString-02', () => {
      
        const result = parseImageString('minio:1234/minio:v123');

        should(result).be.ok();
        should(result).be.eql({
            fullImage: 'minio:1234/minio:v123',
            imagePath: 'minio:1234/minio',
            repository: 'dockerhub',
            name: 'minio:1234/minio',
            tag: 'v123'
        })
        
    })
    ;

    it('parseImageString-03', () => {
      
        const result = parseImageString('minio:1234/minio');

        should(result).be.ok();
        should(result).be.eql({
            fullImage: 'minio:1234/minio',
            imagePath: 'minio:1234/minio',
            repository: 'dockerhub',
            name: 'minio:1234/minio',
            tag: 'latest'
        })
    })
    ;


    it('parseImageString-04', () => {
      
        const result = parseImageString('minio/minio');

        should(result).be.ok();
        should(result).be.eql({
            fullImage: 'minio/minio',
            imagePath: 'minio/minio',
            repository: 'dockerhub',
            name: 'minio/minio',
            tag: 'latest'
        })
        
    })
    ;

    it('parseImageString-05', () => {
      
        const result = parseImageString('gcr.io:1234/google-samples/microservices-demo/productcatalogservice');

        should(result).be.ok();
        should(result).be.eql({
            fullImage: 'gcr.io:1234/google-samples/microservices-demo/productcatalogservice',
            imagePath: 'gcr.io:1234/google-samples/microservices-demo/productcatalogservice',
            repository: 'gcr.io:1234',
            name: 'google-samples/microservices-demo/productcatalogservice',
            tag: 'latest'
        })
        
    })
    ;

    it('parseImageString-06', () => {
      
        const result = parseImageString('nginx');

        should(result).be.ok();
        should(result).be.eql({
            fullImage: 'nginx',
            imagePath: 'nginx',
            repository: 'dockerhub',
            name: 'nginx',
            tag: 'latest'
        })
        
    })
    ;
});
