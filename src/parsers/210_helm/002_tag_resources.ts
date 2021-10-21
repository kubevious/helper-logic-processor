import _ from 'the-lodash';
import { K8sAllParser } from '../../parser-builder/k8s';
import { PackageNamespaceRuntime } from '../../types/parser/pack-ns';
import { PackageHelmVersion } from '../../types/parser/pack-helm-version';
import { LogicItem } from '../../logic/item';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';

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
                    setupAppChartLink(app, helmVersionItem);
                }
                for(const app of item.resolveTargetLinkItems('app'))
                {
                    setupAppChartLink(app, helmVersionItem);
                }
            }
        }

        /*** HELPERS **/
        function setupAppChartLink(app: LogicItem, helmVersionItem: LogicItem)
        {
            const appRuntime = <LogicAppRuntime>app.runtime;
            if (appRuntime.helmCharts[helmVersionItem.dn]) {
                return;
            }
            appRuntime.helmCharts[helmVersionItem.dn] = true;

            helmVersionItem.link('app', app);

            helpers.shadow.create(helmVersionItem, app,
                {
                    kind: NodeKind.helm,
                    name: helmRelease
                });
        }

    })
    ;
