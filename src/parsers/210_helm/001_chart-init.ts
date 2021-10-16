import _ from 'the-lodash';
import { K8sSecretParser } from '../../parser-builder/k8s';
import { NodeKind } from '@kubevious/entity-meta';

export default K8sSecretParser()
    .handler(({ logger, scope, config, item, metadata, namespace, runtime, helpers }) => {

       const name = metadata.name;
       if (!name) {
           return;
       }

       if (!name.startsWith('sh.helm.release.')) {
           return;
       }

       const labels = metadata.labels ?? {};

       const chartName = labels['name'];
       if (!chartName) {
           return;
       }

       const root = scope.logicRootNode.fetchByNaming(NodeKind.pack);

       const nsItem = root.fetchByNaming(NodeKind.ns, namespace!);

       const helmItem = nsItem.fetchByNaming(NodeKind.helm, chartName);
       helmItem.link('secret', item);

       const chartVersion = labels['version'];
       if (!chartVersion) {
           return;
       }

       const helmVersion = helmItem.fetchByNaming(NodeKind.version, chartVersion);
       helmVersion.link('secret', item);
    })
    ;
