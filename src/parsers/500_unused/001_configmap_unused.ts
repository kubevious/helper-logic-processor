import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';

export default K8sParser()
    .target({
        kind: "ConfigMap"
    })
    .handler(({ item }) => {

        if (item.resolveSourceLinks('k8s-owner').length == 0)
        {
            item.addAlert('Unused', 'warn', 'ConfigMap not used.');
        }

    })
    ;
