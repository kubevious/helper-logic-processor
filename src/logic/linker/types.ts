import { LogicItem } from "../item";

export interface LinkInfo
{
    sourceDn: string;
    kind: string;
    path?: any;
    targetDn: string;
}

export interface ResolvedLink
{
    link: LinkInfo;
    dn: string;
    item: LogicItem | null;
}