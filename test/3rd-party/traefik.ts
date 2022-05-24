import 'mocha';
import should = require('should');

import _ from 'the-lodash';

import { setupLogger, LoggerOptions } from 'the-logger';
const loggerOptions = new LoggerOptions().enableFile(false).pretty(true);
const logger = setupLogger('test', loggerOptions);


import { parseDomainNames, parseEndpointPaths } from '../../src/parsers/220_traefik/types/route-utils' ;


describe('traefik', () => {

    /*** PARSE DOMAIN NAME ***/
    it('parseDomainNames-empty', () => {

        const match = "";
        const result = parseDomainNames(match);
        should(result).be.eql([ '*' ]);

    })
    ;

    it('parseDomainNames-one-host', () => {

        const match = "Host(`demo-traefik.kubevious.io`)";
        const result = parseDomainNames(match);
        should(result).be.eql([ 'demo-traefik.kubevious.io' ]);

    })
    ;

    it('parseDomainNames-one-host-and-pathprefix', () => {

        const match = "Host(`demo-traefik.kubevious.io`) && PathPrefix(`/multiversion/v1`)";
        const result = parseDomainNames(match);
        should(result).be.eql([ 'demo-traefik.kubevious.io' ]);

    })
    ;

    it('parseDomainNames-one-host-and-path', () => {

        const match = "Host(`demo-traefik.kubevious.io`) && Path(`/multiversion/v1`)";
        const result = parseDomainNames(match);
        should(result).be.eql([ 'demo-traefik.kubevious.io' ]);

    })
    ;

    it('parseDomainNames-two-hosts', () => {

        const match = "Host(`demo-traefik.kubevious.io`) || Host(`demo-backup.kubevious.io`)";
        const result = parseDomainNames(match);
        should(result).be.eql([ 'demo-traefik.kubevious.io', 'demo-backup.kubevious.io' ]);

    })
    ;

    it('parseDomainNames-custom', () => {

        const match = "Host(`demo-traefik.kubevious.io`) || PathPrefix(`/multiversion/v1`)";
        const result = parseDomainNames(match);
        should(result).be.eql([ match ]);

    })
    ;


    /*** PARSE PATH NAME ***/
    it('parseEndpointPaths-empty', () => {

        const match = "";
        const result = parseEndpointPaths(match, "*");
        should(result).be.eql([ '/*' ]);

    })
    ;

    it('parseEndpointPaths-one-host', () => {

        const match = "Host(`demo-traefik.kubevious.io`)";
        const result = parseEndpointPaths(match, "*");
        should(result).be.eql([ '/*' ]);

    })
    ;

    it('parseEndpointPaths-one-host-and-pathprefix', () => {

        const match = "Host(`demo-traefik.kubevious.io`) && PathPrefix(`/multiversion/v1`)";
        const result = parseEndpointPaths(match, "*");
        should(result).be.eql([ '/multiversion/v1/*' ]);

    })
    ;

    it('parseEndpointPaths-one-host-and-path', () => {

        const match = "Host(`demo-traefik.kubevious.io`) && Path(`/multiversion/v1`)";
        const result = parseEndpointPaths(match, "*");
        should(result).be.eql([ '/multiversion/v1' ]);

    })
    ;

    it('parseEndpointPaths-two-hosts', () => {

        const match = "Host(`demo-traefik.kubevious.io`) || Host(`demo-backup.kubevious.io`)";
        const result = parseEndpointPaths(match, "*");
        should(result).be.eql([ '/*' ]);

    })
    ;

});
