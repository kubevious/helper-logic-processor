import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { TraefikService } from './types/traefik-service';

export default K8sParser<TraefikService>()
    .trace()
    .target({
        api: "traefik.containo.us",
        kind: "Middleware"
    })
    .handler(({ logger, config, scope, item, metadata, namespace, runtime, helpers }) => {

        const globalId = `${namespace!}-${metadata.name!}@kubernetescrd`;
        helpers.thirdParty.traefik.registerGlobalMiddleware(globalId, item);

        helpers.thirdParty.traefik.registerLocalMiddleware(namespace!, metadata.name!, item);

    })
    ;
