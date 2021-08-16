export interface BaseParserBuilder {
    _extract() : BaseParserInfo[]
}

export interface BaseParserInfo
{
    targetKind: string;
    target?: any;
}