import { IConcreteItem, IConcreteRegistry, K8sConfig } from "../../src"

import _ from 'the-lodash';
import { ILogger } from "the-logger";
import { promise as glob } from 'glob-promise';
import { ConcreteItem } from "./concrete-item";
import { ConcreteRegistryFilter, ItemId } from "../../src/types/registry";

import { loadYaml, loadJson } from './file-system';
import { getMockPath } from '../helpers/mock';
import { MyPromise } from "the-promise";

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

    add(obj: K8sConfig) : void
    {
        const item = new ConcreteItem(this.logger, obj);
        this._items[_.stableStringify(item.id)] = item;
    }

    findItem(id: ItemId) : K8sConfig | null
    {
        return this._items[_.stableStringify(id)]?.config ?? null;
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
        const dirName = getMockPath(mockName);
        this.logger.info("Loading Mock Data from: %s", dirName);

        return Promise.resolve()
            .then(() => {
                return glob(`${dirName}/**/*.yaml`)
                    .then((files) => {
                        return MyPromise.serial(files, x => {
                            const obj = loadYaml(x);
                            // this.logger.info("[loadMockData] %s...", x);
                            if (obj) {
                                this.add(obj as K8sConfig);
                            }
                        });
                    })
            })
            .then(() => {
                return glob(`${dirName}/**/*.json`)
                    .then((files) => {
                        return MyPromise.serial(files, x => {
                            const obj = loadJson(x);
                            this.add(obj as K8sConfig);
                        });
                    })
            })
    }

    // debugOutputToFileSystem(dir: string)
    // {
    //     return MyPromise.serial(_.values(this._items), x => x.debugOutputToFileSystem(dir));
    // }

}
