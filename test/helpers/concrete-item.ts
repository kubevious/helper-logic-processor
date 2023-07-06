
import _ from 'the-lodash';
import { extractK8sConfigId, IConcreteItem,  ItemId } from "../../src"
import { ILogger } from "the-logger";
import { ConcreteRegistryFilter } from "../../src/types/registry";

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

    matchesFilter(idFilter? : ConcreteRegistryFilter | null) : boolean
    {
        // if (!_.isObject(this.id)) {
        //     return false;
        // }
        if (!idFilter) {
            return true;
        }
        // TODO: VALIDATE THIS! 
        // if (!_.isObject(idFilter)) {
        //     return false;
        // }
        for(const key of _.keys(idFilter!)) {
            const filterVal = _.get(idFilter, key);
            const idVal = _.get(this.id, key);
            if (_.isNull(filterVal)) {
                if (idVal) {
                    return false;
                }
            } else {
                if (!_.isEqual(filterVal, idVal)) {
                    return false;
                }
            }
        }
        return true;
    }

    // matchesFilter(filter?: ConcreteRegistryFilter | null) : boolean
    // {
    //     if (!filter) {
    //         return true;
    //     }

    //     if (_.isNull(filter.api)) {
    //         if (this.id.api) {
    //             return false;
    //         }
    //     } else {
    //         if (filter.api) {
    //             if (filter.api !== this.id.api) {
    //                 return false;
    //             }
    //         }
    //     }

    //     if (filter.kind) {
    //         if (filter.kind !== this.id.kind) {
    //             return false;
    //         }
    //     }
        
    //     return true;
    // }

    // debugOutputToFileSystem(dir: string)
    // {

    // }
}