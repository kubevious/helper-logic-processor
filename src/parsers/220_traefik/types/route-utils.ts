export function parseDomainName(match: string)
{
    return match ?? "*";
}

export function parseEndpointPath(match: string)
{
    return match ?? "/";
}