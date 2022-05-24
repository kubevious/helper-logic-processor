import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';

export default K8sParser()
    .target({
        api: "traefik.containo.us",
        kind: "Middleware"
    })
    .handler(({ item }) => {

        if (item.resolveTargetLinks(LogicLinkKind.gateway).length == 0)
        {
            item.raiseAlert(ValidatorID.TRAEFIK_UNUSED_MIDDLEWARE, 'Middleware not used.');
        }

    })
    ;
