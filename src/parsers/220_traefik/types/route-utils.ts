const REGEX_ONLY_HOST = /^Host\(`(\S+)`\)$/gm;
const REGEX_HOST_AND_PATH_PREFIX = /^Host\(`(\S+)`\) && PathPrefix\(`(\S+)`\)$/gm;
const REGEX_HOST_AND_PATH = /^Host\(`(\S+)`\) && Path\(`(\S+)`\)$/gm;
const REGEX_TWO_HOSTS = /^Host\(`(\S+)`\) \|\| Host\(`(\S+)`\)$/gm;
const REGEX_TWO_HOSTS_AND_PREFIX = /^\(Host\(`(\S+)`\) \|\| Host\(`(\S+)`\)\) && PathPrefix\(`(\S+)`\)$/gm;
const REGEX_PREFIX = /^PathPrefix\(`(\S+)`\)$/gm;
const REGEX_TWO_PREFIX = /^PathPrefix\(`(\S+)`\) \|\| PathPrefix\(`(\S+)`\)$/gm;

export function parseDomainNames(rule: string) : string[]
{
    rule = rule ?? '';

    if (rule.length === 0) {
        return [ '*' ];
    }

    {
        const match = findAll(REGEX_ONLY_HOST, rule);
        if (match) {
            return [ match[1] ];
        }
    }

    {
        const match = findAll(REGEX_HOST_AND_PATH_PREFIX, rule);
        if (match) {
            return [ match[1] ];
        }
    }

    {
        const match = findAll(REGEX_HOST_AND_PATH, rule);
        if (match) {
            return [ match[1] ];
        }
    }


    {
        const match = findAll(REGEX_TWO_HOSTS, rule);
        if (match) {
            return [ match[1], match[2] ];
        }
    }

    {
        const match = findAll(REGEX_TWO_HOSTS_AND_PREFIX, rule);
        if (match) {
            return [ match[1], match[2] ];
        }
    }

    {
        if (findAll(REGEX_PREFIX, rule) || findAll(REGEX_TWO_PREFIX, rule)) {
            return [ "*" ];
        }
    }

    return [ rule ?? "*" ];
}

export function parseEndpointPaths(rule: string, domainName: string) : string[]
{
    rule = rule ?? '';

    if (rule.length === 0) {
        return [ '/*' ];
    }

    {
        const match = findAll(REGEX_ONLY_HOST, rule);
        if (match) {
            return [ '/*' ];
        }
    }

    {
        const match = findAll(REGEX_HOST_AND_PATH_PREFIX, rule);
        if (match) {
            return [ `${match[2]}/*` ];
        }
    }

    {
        const match = findAll(REGEX_HOST_AND_PATH, rule);
        if (match) {
            return [ match[2] ];
        }
    }


    {
        const match = findAll(REGEX_TWO_HOSTS, rule);
        if (match) {
            return [ '/*' ];
        }
    }


    {
        const match = findAll(REGEX_TWO_HOSTS_AND_PREFIX, rule);
        if (match) {
            return [ `${match[3]}/*` ];
        }
    }


    {
        const match = findAll(REGEX_PREFIX, rule);
        if (match) {
            return [ `${match[1]}/*` ];
        }
    }

    {
        const match = findAll(REGEX_TWO_PREFIX, rule);
        if (match) {
            return [ `${match[1]}/*`, `${match[2]}/*` ];
        }
    }

    return [ rule ?? "/*" ];
}


function findAll(regex: RegExp, sourceString: string) {
    const output : any[] = []
    let m : any;
    while ((m = regex.exec(sourceString)) !== null) {
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }
        
        m.forEach((match: any, groupIndex: number) => {
            output.push(match);
            // console.log(`Found match, group ${groupIndex}: ${match}`);
        });
    } 
    if (output.length === 0) {
        return null;
    }
    return output
}