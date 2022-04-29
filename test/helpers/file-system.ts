import _ from 'the-lodash';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import * as yaml from 'js-yaml';

import { makeLogger } from '../helpers/logger';
const logger = makeLogger('file-system');

export function loadYaml(filePath: string)
{
    logger.verbose("Loading YAML: %s", filePath);
    const contents = readFileSync(filePath, { encoding: 'utf8' });
    return yaml.load(contents);
}


export function loadJson(filePath: string)
{
    logger.verbose("Loading JSON: %s", filePath);
    const contents = readFileSync(filePath, { encoding: 'utf8' });
    return JSON.parse(contents);
}

export function tryLoadJson(filePath: string)
{
    if (existsSync(filePath)) {
        return loadJson(filePath);
    }
    return null;
}

export function saveJson(filePath: string, data: any)
{
    logger.verbose("Writing JSON: %s", filePath);
    const contents = JSON.stringify(data, null, 4);
    writeFileSync(filePath, contents, { encoding: 'utf8' });
}