import _ from 'the-lodash';
import { LogicItem } from "../../";
import { LinkInfo, ResolvedLink } from "./types";
import { LogicScope } from '../../scope';

type TargetedLinkMap = {
    [dn: string] : {
        [kind: string] : LinkInfo[]
    } 
}

export class LogicLinkRegistry
{
    private _logicScope: LogicScope;
    private _dict : Record<string, LinkInfo> = {};
    private _direct : TargetedLinkMap = {};
    private _inverted : TargetedLinkMap = {};
    
    constructor(logicScope: LogicScope)
    {
        this._logicScope = logicScope;
    }

    link(sourceItemOrDn: LogicItem | string, kind: string, path: any, targetItemOrDn: LogicItem | string) : LogicItem | null
    {
        const link : LinkInfo = {
            sourceDn: _.isString(sourceItemOrDn) ? sourceItemOrDn : sourceItemOrDn.dn,
            kind: kind,
            path: _.isNullOrUndefined(path) ? undefined : path,
            targetDn: _.isString(targetItemOrDn) ? targetItemOrDn : targetItemOrDn.dn
        }

        const id = _.stableStringify(link);
        if (!this._dict[id]) {
            this._dict[id] = link;
            this._registerLink(this._direct, link.sourceDn, link);
            this._registerLink(this._inverted, link.targetDn, link);
        }

        return this._logicScope.findItem(link.targetDn) || null;
    }

    private _registerLink(map: TargetedLinkMap, dn: string, link: LinkInfo)
    {
        let dnMap = map[dn];
        if(!dnMap) {
            dnMap = {};
            map[dn] = dnMap;
        }

        let kindList = dnMap[link.kind];
        if(!kindList) {
            kindList = [];
            dnMap[link.kind] = kindList;
        }

        kindList.push(link);
    }

    findTargetLinks(sourceDn: string, kind?: string) : LinkInfo[]
    {
        const links = this._findLinksInDict(this._direct, sourceDn, kind);
        return links;
    }

    findSourceLinks(targetDn: string, kind?: string) : LinkInfo[]
    {
        const links = this._findLinksInDict(this._inverted, targetDn, kind);
        return links;
    }

    resolveTargetLinks(sourceDn: string, kind?: string) : ResolvedLink[]
    {
        const links = this.findTargetLinks(sourceDn, kind);
        let resolvedLinks = links.map(x => this._resolveLink(x.targetDn, x));
        return resolvedLinks;
    }

    resolveSourceLinks(targetDn: string, kind?: string) : ResolvedLink[]
    {
        const links = this.findSourceLinks(targetDn, kind);
        let resolvedLinks = links.map(x => this._resolveLink(x.sourceDn, x));
        return resolvedLinks;
    }

    resolveTargetItems(sourceDn: string, kind?: string) : LogicItem[]
    {
        let resolvedLinks = this.resolveTargetLinks(sourceDn, kind);
        resolvedLinks = resolvedLinks.filter(x => x.item);
        const dict = _.makeDict(resolvedLinks, x => x.dn, x => x.item!)
        return _.values(dict);
    }

    resolveSourceItems(targetDn: string, kind?: string) : LogicItem[]
    {
        let resolvedLinks = this.resolveSourceLinks(targetDn, kind);
        resolvedLinks = resolvedLinks.filter(x => x.item);
        const dict = _.makeDict(resolvedLinks, x => x.dn, x => x.item!)
        return _.values(dict);
    }

    private _findLinksInDict(map : TargetedLinkMap, dn: string, kind?: string) : LinkInfo[]
    {
        const dnMap = map[dn];
        if (!dnMap) {
            return [];
        }
        if (kind) {
            const kindList = dnMap[kind];
            return kindList;
        } else {
            return _.flatten(_.values(dnMap));
        }
    }

    private _resolveLink(dn: string, link: LinkInfo)
    {
        const resolved : ResolvedLink = {
            link: link,
            dn: dn,
            item: this._logicScope.findItem(dn) || null
        }
        return resolved;
    }


}