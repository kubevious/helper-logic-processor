import { IConcreteItem, IConcreteRegistry } from "../../src"

import _ from 'the-lodash';
import { Promise } from 'the-promise';
import * as Path from 'path';
import { ILogger } from "the-logger";
import { promise as glob } from 'glob-promise';
import { ConcreteItem } from "./concrete-item";
import { ConcreteRegistryFilter } from "../../src/types/registry";

import { loadYaml, loadJson } from './file-system';

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
        const dirName = Path.resolve(__dirname, '..', '..', 'mock-data', mockName);
        this.logger.info("Loading Mock Data from: %s", dirName);

        return Promise.resolve()
            .then(() => {
                return glob(`${dirName}/**/*.yaml`)
                    .then((files) => {
                        return Promise.serial(files, x => {
                            const obj = loadYaml(x);
                            this.addItem(obj);
                        });
                    })
            })
            .then(() => {
                return glob(`${dirName}/**/*.json`)
                    .then((files) => {
                        return Promise.serial(files, x => {
                            const obj = loadJson(x);
                            this.addItem(obj);
                        });
                    })
            })
    }

    // debugOutputToFileSystem(dir: string)
    // {
    //     return Promise.serial(_.values(this._items), x => x.debugOutputToFileSystem(dir));
    // }

}
