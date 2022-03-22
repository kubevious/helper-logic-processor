import { LogicItem } from "../item";
import { LogicLinkKind } from '../link-kind';

export interface LinkInfo
{
    sourceDn: string;
    kind: LogicLinkKind;
    path?: any;
    targetDn: string;
}

export interface ResolvedLink
{
    link: LinkInfo;
    dn: string;
    item: LogicItem | null;
}