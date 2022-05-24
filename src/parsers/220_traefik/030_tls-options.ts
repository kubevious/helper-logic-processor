import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';

export default K8sParser()
    .target({
        api: "traefik.containo.us",
        kind: "TLSOption"
    })
    .handler(({ logger, config, scope, item, metadata, namespace, runtime, helpers }) => {

        helpers.thirdParty.traefik.registerTLSOptions(namespace!, metadata.name!, item);

    })
    ;
