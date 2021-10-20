import _ from 'the-lodash';
import { K8sAllParser } from '../../parser-builder/k8s';
import { PackageNamespaceRuntime } from '../../types/parser/pack-ns';
import { PackageHelmVersion } from '../../types/parser/pack-helm-version';

export default K8sAllParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        if (config?.metadata?.ownerReferences) {
            return;
        }

        const annotations = config?.metadata?.annotations ?? {};

        const helmNs = annotations['meta.helm.sh/release-namespace'];
        const helmRelease = annotations['meta.helm.sh/release-name'];

        if (!helmNs || !helmRelease) {
            return;
        }

        const packNsDn = `root/pack/ns-[${helmNs}]`;
        const packNs = scope.findItem(packNsDn);
        if (packNs)
        {
            const nsRuntime = <PackageNamespaceRuntime>packNs.runtime;

            const helmVersionItem = nsRuntime.helm[helmRelease];
            if (helmVersionItem)
            {
                const helmVersionRuntime = <PackageHelmVersion>helmVersionItem.runtime;
                helmVersionRuntime.configs[item.dn] = true;

                for(const app of item.resolveSourceLinkItems('app'))
                {
                    helmVersionRuntime.configs[app.dn] = true;
                }
                for(const app of item.resolveTargetLinkItems('app'))
                {
                    helmVersionRuntime.configs[app.dn] = true;
                }
            }
        }
    })
    ;
