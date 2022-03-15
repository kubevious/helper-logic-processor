import _ from 'the-lodash';
import { NodeKind } from '@kubevious/entity-meta';

export interface RnInfo {
    kind: NodeKind,
    name?: string | null
}

function makeRn(infoOrKind : RnInfo | string)
{
    if (_.isString(infoOrKind)) {
        return infoOrKind;
    }
    if (infoOrKind.name) {
        return `${infoOrKind.kind}-[${infoOrKind.name}]`
    }
    return infoOrKind.kind;
}

export function makeDn(parts: RnInfo[])
{
    return parts.map(x => makeRn(x)).join('/');
}