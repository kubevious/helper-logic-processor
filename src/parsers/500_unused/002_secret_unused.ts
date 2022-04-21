import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default K8sParser()
    .target({
        kind: "Secret"
    })
    .handler(({ item }) => {

        if ((item.resolveSourceLinks(LogicLinkKind.k8s).length == 0) &&
            (item.resolveTargetLinkItems(LogicLinkKind.svcaccount).length == 0))
        {
            item.raiseAlert(ValidatorID.UNUSED_SECRET, 'Secret not used.');
        }

    })
    ;
