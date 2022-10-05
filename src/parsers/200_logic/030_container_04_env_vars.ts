import _ from 'the-lodash';
import { PropsId, PropsKind } from '@kubevious/entity-meta';
import { LogicContainerParser } from '../../parser-builder/logic';
import { K8sConfig } from '../../types/k8s';
import { LogicLauncherRuntime } from '../../types/parser/logic-launcher';
import { LogicLinkKind } from '../../logic/link-kind';

export default LogicContainerParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        const app = item.parent;
        const launcher = app!.resolveTargetLinkItems(LogicLinkKind.launcher)[0]!;
        const launcherRuntime = launcher.runtime as LogicLauncherRuntime;

        const podSpecConfig : K8sConfig = {
            apiVersion: 'v1',
            kind: 'Pod',
            metadata: _.clone(launcherRuntime.podTemplateSpec?.metadata ?? {}),
            spec: launcherRuntime.podTemplateSpec?.spec ?? {},
        }
        podSpecConfig.metadata.namespace = runtime.namespace;

        runtime.envVars = helpers.environment.extractEnvVars(
            item,
            config,
            podSpecConfig,
            launcherRuntime.podTemplateSpec?.spec?.containers ?? [],
            `${launcherRuntime.app}-${item.naming}`);

        if (_.keys(runtime.envVars).length > 0)
        {
            item.addProperties({
                kind: PropsKind.keyValue,
                id: PropsId.env,
                config: runtime.envVars
            });    
        }            

    })
    ;
