import { NodeKind } from '@kubevious/entity-meta';
import _ from 'the-lodash';
import { LogicItem } from '../../logic/item';
import { LogicParser } from '../../parser-builder';
import { makeLogicTarget } from '../../processor/k8s/helpers';
import { K8sConfig } from '../../types/k8s';
import { LogicAppRuntime, SourceLauncherInfoRuntime } from '../../types/parser/logic-app';
import { parseApiVersion } from '../../utils/k8s';

interface AppTargetMeta {
    api?: string,
    k8sKind: string,
    nodeKind: NodeKind,
    podTemplateSelector: (config : any) => any,
    replicaCountSelector: (config : any) => any,
}

export default LogicParser()
    .target({
        path: []
    })
    .handler(({ scope, logger, helpers }) => {

        const targets: AppTargetMeta[] = [
            {
                api: "batch",
                k8sKind: "CronJob",
                nodeKind: NodeKind.cronjob,
                podTemplateSelector: (config) => config.spec?.jobTemplate.spec?.template,
                replicaCountSelector: (config) => null
            },
            {
                api: "batch",
                k8sKind: "Job",
                nodeKind: NodeKind.job,
                podTemplateSelector: (config) => config.spec?.template,
                replicaCountSelector: (config) => null
            },
            {
                api: "apps",
                k8sKind: "StatefulSet",
                nodeKind: NodeKind.ss,
                podTemplateSelector: (config) => config.spec?.template,
                replicaCountSelector: (config) => config.spec?.replicas ?? null
            },
            {
                api: "apps",
                k8sKind: "DaemonSet",
                nodeKind: NodeKind.ds,
                podTemplateSelector: (config) => config.spec?.template,
                replicaCountSelector: (config) => config.spec?.replicas ?? null
            },
            {
                api: "apps",
                k8sKind: "Deployment",
                nodeKind: NodeKind.depl,
                podTemplateSelector: (config) => config.spec?.template,
                replicaCountSelector: (config) => config.spec?.replicas ?? null
            },
            { 
                k8sKind: "ReplicationController",
                nodeKind: NodeKind.rc,
                podTemplateSelector: (config) => config.spec?.template,
                replicaCountSelector: (config) => config.spec?.replicas ?? null
            },
            { 
                api: "apps",
                k8sKind: "ReplicaSet",
                nodeKind: NodeKind.replicaset,
                podTemplateSelector: (config) => config.spec?.template,
                replicaCountSelector: (config) => config.spec?.replicas ?? null
            },
            // {
            //     k8sKind: "Pod",
            //     nodeKind: NodeKind.pod,
            //     podTemplateSelector: (config) => config,
            //    replicaCountSelector: (config) => 1
            // }
        ];

        const TerminatorDict = _.makeDict(targets, x => x.api ? `${x.api}::${x.k8sKind}` : x.k8sKind, x => x);
        // logger.info("****** TerminatorDict: ", TerminatorDict);

        const visited : { [dn : string] : boolean } = {};
        const appRootDns : string[] = [];


        for(const target of targets)
        {
            processK8sTarget(target);
        }

        // logger.info("****** ALL APP ROOTS: ", appRootDns);

        /****/

        function processK8sTarget(target: AppTargetMeta)
        {
            logger.info("K8s Target: ", target);

            const logicTarget = makeLogicTarget({ api: target.api, kind: target.k8sKind });
            // logger.info("logicTarget: ", logicTarget);

            const items = scope.findItemsByPath(logicTarget);

            for(const item of items)
            {
                logger.info("   -> %s", item.dn);
                processItem(item);
            }
        }

        function processItem(item: LogicItem)
        {
            if (visited[item.dn]) {
                return;
            }
            visited[item.dn] = true;

            const ownerDns = helpers.k8s.ownerReferenceDict.getOwnerDns(item);
            let hasRelevantOwner = false;
            for(const ownerDn of ownerDns)
            {
                if (processItemOwner(ownerDn)) {
                    hasRelevantOwner = true;
                }
            }

            if (!hasRelevantOwner) {
                makeAppRoot(item);
            }
        }

        function processItemOwner(ownerDn: string) : boolean
        {
            logger.info(" ownerDn: %s", ownerDn);

            const ownerItem = scope.findItem(ownerDn);
            if (!ownerItem) {
                return false;
            }

            const apiVersion = ownerItem?.config?.apiVersion;
            const kind = ownerItem?.config?.kind;
            if (apiVersion) {
                const apiInfo = parseApiVersion(apiVersion);
                const kindKey = apiInfo.apiName ? `${apiInfo.apiName}::${kind}` : kind;
                logger.info("    KIND KEY: %s", kindKey);

                if (TerminatorDict[kindKey]) {
                    logger.info("    TerminatorKind: %s -> %s", kindKey, ownerDn);

                    processItem(ownerItem);
                    return true;
                }
            }

            return false;
        }

        function makeAppRoot(item: LogicItem)
        {
            // logger.info("****** APP ROOT: %s", item.dn);
            appRootDns.push(item.dn);

            const config = item.config as K8sConfig;

            const apiInfo = parseApiVersion(config.apiVersion);
            const kindKey = apiInfo.apiName ? `${apiInfo.apiName}::${config.kind}` : config.kind;
            const terminatorInfo = TerminatorDict[kindKey];
            if (!terminatorInfo) {
                logger.error("Terminator %s not found. DN: %s", kindKey, item.dn);
                return;
            }
 
            const appNamespace = config.metadata.namespace!;
            const appName = config.metadata.name!;

            const root = scope.logicRootNode.fetchByNaming(NodeKind.logic);
            const ns = root.fetchByNaming(NodeKind.ns, appNamespace);
            const app = ns.fetchByNaming(NodeKind.app, appName);

            const launcherInfo : SourceLauncherInfoRuntime = {
                dn: item.dn,
                kind: config.kind!,
                nodeKind: terminatorInfo.nodeKind,
                replicas: terminatorInfo.replicaCountSelector(config) ?? null,
                podTemplateSpec: terminatorInfo.podTemplateSelector(config) || {},
            }

            const appRuntime = (<LogicAppRuntime>app.runtime);
            if (!appRuntime.sourceLauncherInfos) {
                appRuntime.sourceLauncherInfos = [];
            }
            appRuntime.sourceLauncherInfos.push(launcherInfo);
            appRuntime.namespace = appNamespace;
            appRuntime.app = appName;
            appRuntime.launcherKind = launcherInfo.kind;
            appRuntime.podTemplateSpec = launcherInfo.podTemplateSpec;
            appRuntime.launcherReplicas = launcherInfo.replicas;
        }

    })
    ;
