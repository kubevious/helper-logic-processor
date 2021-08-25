import _ from 'the-lodash';
import { LogicItem } from "..";

export class LogicItemLinker
{
    private _dict : Record<string, LinkInfo> = {};
    
    constructor()
    {

    }

    link(kind: string, target: LogicItem)
    {
        const link = {
            kind: kind,
            target: target
        }
        this._dict[kind] = link;
    }

    findLink(kind: string) : LogicItem | null
    {
        const item = this._dict[kind];
        if (item) {
            return item.target;
        }
        return null;
    }

    getAllLinks()
    {
        return _.values(this._dict);
    }

}

export interface LinkInfo
{
    kind: string,
    target: LogicItem // or maybe use DN??
}