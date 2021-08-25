import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';

export default K8sParser()
    .only()
    .target({
        api: "apps",
        kind: "Deployment"
    })
    .handler(({ logger, scope, config, item}) => {

        const root = scope.logicRootNode.fetchByNaming('logic', '');

        const ns = root.fetchByNaming('ns', config.metadata.namespace!);

        const app = ns.fetchByNaming('app', config.metadata.name);
        item.link('app', app);

        const launcher = app.fetchByNaming('launcher', config.kind);
        launcher.setConfig(config);
        item.link('launcher', launcher);
    })
    ;
