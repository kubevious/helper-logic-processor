import _ from 'the-lodash';
import * as Path from 'path';

export function getMockPath(filePath: string)
{
    return Path.join(__dirname, '..', '..', '..', 'mock-data.git', 'cluster-data', filePath);
}
