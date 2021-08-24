import _ from 'the-lodash';
import { LogicItem } from '../../item';
import { LogicParser } from '../../parser-builder';
import { K8sConfig } from '../../types/k8s';

const yaml = require('js-yaml');

export default LogicParser()
    .only()
    .target({
        path: [
            "k8s",
            "ns",
            {
                kind: "api",
                name: "apps"
            },
            "version",
            {
                kind: "kind",
                name: "Deployment"
            },
            "resource"]
    })
    .kind('launcher')
    .handler(({ scope, item, createItem, createAlert, namespaceScope }) => {

        const config : K8sConfig = <K8sConfig>item.config;

        const root = scope.logicRootNode.fetchByNaming('logic', '');

        const ns = root.fetchByNaming('ns', config.metadata.namespace!);

        const app = ns.fetchByNaming('app', config.metadata.name);

        // item.link('app', app);

        const launcher = ns.fetchByNaming('launcher', config.kind);

        // item.link('launcher', launcher);

        // createItem(app, config.kind)

    })
    ;