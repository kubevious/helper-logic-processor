import _ from 'the-lodash';
import { Promise } from 'the-promise';
import { ILogger } from 'the-logger/dist';
import { ParserBuilder } from './base/builder'
import * as path from 'path' 
import { promise as glob } from 'glob-promise';

export class ParserLoader
{
    private logger : ILogger;
    private _allParsers : ParserInfo[] = [];
    private _parsers : ParserInfo[] = [];

    constructor(logger: ILogger)
    {
        this.logger = logger.sublogger("ProcessorLoader");
    }

    get parsers() {
        return this._parsers;
    }

    init()
    {
        return Promise.resolve()
            .then(() => this._extractProcessors('parsers'))
            .then(() => this._filterParser())
            ;
    }

    private _extractProcessors(location : string)
    {
        this.logger.info('[_extractProcessors] location: %s', location);
        const relSearchDir = `../${location}`
        const searchPath = path.resolve(__dirname, relSearchDir);
        this.logger.info('[_extractProcessors] search path: %s', searchPath);

        return glob(`${searchPath}/**/*.ts`)
            .then(files => {
                return Promise.serial(files, x => {
                    const relPath = x.substr(searchPath.length + 1);
                    const moduleName = relPath.replace('.d.ts', '').replace('.ts', '');
                    const modulePath = `${relSearchDir}/${moduleName}`;
                    this._loadProcessor(moduleName, modulePath)
                });
            });
    }

    private _loadProcessor(moduleName : string, importPath : string)
    {
        this.logger.info('[_loadProcessor] %s...', moduleName);
        this.logger.debug('[_loadProcessor] %s from %s...', moduleName, importPath);

        const parserModule = require(importPath);

        let defaultExport = parserModule.default;
        if (!defaultExport) {
            this.logger.error("Invalid Parser: %s", moduleName);
            throw new Error("Invalid Parser: " + moduleName);
            return;
        }

        let baseParserBuilder = <ParserBuilder>defaultExport;
        this._allParsers.push({
            moduleName: moduleName,
            baseBuilder: baseParserBuilder
        });
    }

    private _filterParser()
    {
        const nonSkipped = this._allParsers.filter(x => !x.baseBuilder.shouldSkip());
        const only = this._allParsers.filter(x => x.baseBuilder.isOnly());

        if (only.length > 0) {
            this._parsers = only;
        } else {
            this._parsers = nonSkipped;
        }
    }

}

export interface ParserInfo
{
    moduleName: string,
    baseBuilder: ParserBuilder
}