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

                const filteredFiles = files.filter(x => {
                    const parts = x.split('/');
                    if (parts.includes('types')) {
                        return false;
                    }
                    return true;
                })

                return Promise.parallel(filteredFiles, x => {
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

        const defaultExport = parserModule.default;
        if (!defaultExport) {
            this.logger.error("Invalid Parser: %s", moduleName);
            throw new Error("Invalid Parser: " + moduleName);
            return;
        }

        const baseParserBuilder = <ParserBuilder>defaultExport;
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

        {
            const breakerIndex = _.findIndex(this._parsers, x => x.baseBuilder.isBreakpoint());
            if (breakerIndex >= 0)
            {
                this.logger.error('[_extractProcessors] *****************************************');
                this.logger.error('[_extractProcessors] *****************************************');
                this.logger.error('[_extractProcessors] ********** BREAKPOINT DETECTED **********');
                this.logger.error('[_extractProcessors] *****************************************');
                this.logger.error('[_extractProcessors] *****************************************');
                this.logger.error('[_extractProcessors] breakerIndex: %s', breakerIndex);

                const parsers = _.take(this._parsers, breakerIndex + 1);
                const survivors = _.drop(this._parsers, breakerIndex + 1).filter(x => x.baseBuilder.doesSurviveBreakpoint());
                this._parsers = _.concat(parsers, survivors);
            }
        }
    }

}

export interface ParserInfo
{
    moduleName: string,
    baseBuilder: ParserBuilder
}