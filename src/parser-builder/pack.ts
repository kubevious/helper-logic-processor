import _ from 'the-lodash';
import { LogicParser } from './';
import { NodeKind } from '@kubevious/entity-meta';

import { PackageHelmVersion } from '../types/parser/pack-helm-version';

export function PackHelmVersionParser() {

    return LogicParser<{}, PackageHelmVersion>()
        .target({
            path: [ NodeKind.pack, NodeKind.ns, NodeKind.helm, NodeKind.version]
        });
}