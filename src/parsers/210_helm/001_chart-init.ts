import _ from 'the-lodash';
import { K8sSecretParser } from '../../parser-builder/k8s';
import { NodeKind } from '@kubevious/entity-meta';
import { PackageNamespaceRuntime } from '../../types/parser/pack-ns';
import { PackageHelmVersion } from '../../types/parser/pack-helm-version';
import { LogicLinkKind } from '../../logic/link-kind';

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

        const chartVersion = labels['version'];
        if (!chartVersion) {
            return;
        }

        const chartStatus = labels['status'];
        if (chartStatus === 'superseded') {
            return;
        }

        const root = scope.logicRootNode.fetchByNaming(NodeKind.pack);

        const nsItem = root.fetchByNaming(NodeKind.ns, namespace!);
        const nsRuntime = <PackageNamespaceRuntime>nsItem.runtime;
        if (!nsRuntime.helm) {
            nsRuntime.helm = {};
        }
        
        const helmItem = nsItem.fetchByNaming(NodeKind.helm, chartName);
        
        const helmVersion = helmItem.fetchByNaming(NodeKind.version, chartVersion);
        helmVersion.link(LogicLinkKind.secret, item);

        const helmVersionRuntime = <PackageHelmVersion>helmVersion.runtime;
        helmVersionRuntime.configs = {};

        if (chartStatus === 'deployed') {
            nsRuntime.helm[chartName] = helmVersion;
        }
    })
    ;
