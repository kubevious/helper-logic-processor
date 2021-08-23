export interface BaseParserBuilder {
    isOnly() : boolean;
    shouldSkip() : boolean;
    
    _extract() : BaseParserInfo[]
}

export interface BaseParserInfo
{
    targetKind: string;
    target?: any;
}

