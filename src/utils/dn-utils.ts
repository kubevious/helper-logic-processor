import _ from 'the-lodash';

export interface RnInfo {
    kind: string,
    name?: string
}

export function makeRn(infoOrKind : RnInfo | string)
{
    if (_.isString(infoOrKind)) {
        return infoOrKind;
    }
    if (infoOrKind.name) {
        return `${infoOrKind.kind}-[${infoOrKind.name}]`
    }
    return infoOrKind.kind;
}

export function makeDn(parts: (RnInfo | string)[])
{
    return parts.map(x => makeRn(x)).join('/');
}