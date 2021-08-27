import _ from 'the-lodash';
import { LogicItem } from "..";
import { LogicScope } from '../scope';

export class LogicItemLinker
{
    private _logicScope: LogicScope;
    private _dict : Record<string, LinkInfo> = {};
    
    constructor(logicScope: LogicScope)
    {
        this._logicScope = logicScope;
    }

    link(kind: string, targetItemOrDn: LogicItem | string)
    {
        const link = {
            kind: kind,
            targetDn: _.isString(targetItemOrDn) ? targetItemOrDn : targetItemOrDn.dn
        }
        this._dict[kind] = link;
    }

    resolveLink(kind: string) : LogicItem | null
    {
        const item = this._dict[kind];
        if (item) {
            return this._logicScope.findItem(item.targetDn);
        }
        return null;
    }

    findLink(kind: string) : LinkInfo | null
    {
        const item = this._dict[kind];
        if (item) {
            return item
        }
        return null;
    }

    getAllLinks()
    {
        return _.values(this._dict).map(x => {
            return {
                kind: x.kind,
                targetDn: x.targetDn,
                target: this._logicScope.findItem(x.targetDn)
            }
        });
    }

}

export interface LinkInfo
{
    kind: string,
    targetDn: string //LogicItem // or maybe use DN??
}