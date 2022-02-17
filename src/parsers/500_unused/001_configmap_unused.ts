import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { ValidatorID } from '@kubevious/entity-meta';

export default K8sParser()
    .target({
        kind: "ConfigMap"
    })
    .handler(({ item }) => {

        if (item.resolveSourceLinks('k8s').length == 0)
        {
            item.raiseAlert(ValidatorID.UNUSED_CONFIG_MAP, 'ConfigMap not used.');
        }

    })
    ;
