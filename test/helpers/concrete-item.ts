

import { extractK8sConfigId, IConcreteItem,  ItemId } from "../../src"
import { Promise } from 'the-promise';
import { ILogger } from "the-logger";
import { ConcreteRegistryFilter } from "../../src/registry";

export class ConcreteItem implements IConcreteItem
{
    private _id: ItemId;
    private _config: any;
    private logger: ILogger;
    
    constructor(logger: ILogger, config: any)
    {
        this.logger = logger;
        this._config = config;
        
        this._id = extractK8sConfigId(config);
    }

    get id() {
        return this._id;
    }

    get config() {
        return this._config;
    }

    matchesFilter(filter?: ConcreteRegistryFilter | null) : boolean
    {
        if (!filter) {
            return true;
        }
        
        if (filter.api) {
            if (filter.api !== this.id.api) {
                return false;
            }
        }

        if (filter.kind) {
            if (filter.kind !== this.id.kind) {
                return false;
            }
        }
        
        return true;
    }

    // debugOutputToFileSystem(dir: string)
    // {

    // }
}