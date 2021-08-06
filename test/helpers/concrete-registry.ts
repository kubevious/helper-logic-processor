import { IConcreteItem, IConcreteRegistry } from "../../src"

import _ from 'the-lodash';
import { Promise } from 'the-promise';
import { readFileSync } from 'fs';
import * as Path from 'path';
import * as yaml from 'js-yaml';
import { ILogger } from "the-logger";
import { promise as glob } from 'glob-promise';
import { ConcreteItem } from "./concrete-item";
import { ConcreteRegistryFilter } from "../../src/registry";

export class ConcreteRegistry implements IConcreteRegistry
{
    private _date : Date;
    private logger: ILogger;
    private _items : Record<string, ConcreteItem> = {};
    
    constructor(logger: ILogger)
    {
        this._date = new Date();
        this.logger = logger;
    }

    get date() {
        return this._date;
    }

    addItem(config: any)
    {
        const item = new ConcreteItem(this.logger, config);
        this._items[_.stableStringify(item.id)] = item;
    }

    filterItems(filter?: ConcreteRegistryFilter | null) : IConcreteItem[]
    {
        // this.logger.info("[filterItems] Filter: ", filter);
        return _.values(this._items).filter(x => x.matchesFilter(filter));
    }

    debugOutputCapacity() : void
    {
        this.logger.info("[CONCRETE REGISTRY] Size: %s", _.keys(this._items).length);
    }

    loadMockData(mockName : string)
    {
        let dirName = Path.resolve(__dirname, '..', '..', 'mock-data', mockName);
        this.logger.error("Dir name: %s", dirName);

        return Promise.resolve()
            .then(() => {
                return glob(`${dirName}/**/*.yaml`)
                    .then((files) => {
                        return Promise.serial(files, x => this._loadYaml(x));
                    })
            })
            .then(() => {
                return glob(`${dirName}/**/*.json`)
                    .then((files) => {
                        return Promise.serial(files, x => this._loadJson(x));
                    })
            })
    }

    // debugOutputToFileSystem(dir: string)
    // {
    //     return Promise.serial(_.values(this._items), x => x.debugOutputToFileSystem(dir));
    // }

    private _loadYaml(filePath: string)
    {
        this.logger.verbose("Loading YAML: %s", filePath);
        let contents = readFileSync(filePath, { encoding: 'utf8' });
        const obj = yaml.load(contents);
        this.addItem(obj);
    }


    private _loadJson(filePath: string)
    {
        this.logger.verbose("Loading JSON: %s", filePath);
        let contents = readFileSync(filePath, { encoding: 'utf8' });
        const obj = JSON.parse(contents);
        this.addItem(obj);
    }
}
