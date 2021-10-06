import _ from 'the-lodash';
import { ScopeParser } from '../../parser-builder';


export default ScopeParser()
    .target({
        namespaced: true,
        scopeKind: 'NetworkPolicy'
    })
    .handler(({ itemScope, helpers }) => {
        
        helpers.common.determineSharedFlag(itemScope);

    })
    ;