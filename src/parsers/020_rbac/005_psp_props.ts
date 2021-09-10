import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { PodSecurityPolicy } from 'kubernetes-types/policy/v1beta1';

export default K8sParser<PodSecurityPolicy>()
    .target({
        clustered: true,
        api: "policy",
        kind: "PodSecurityPolicy"
    })
    .handler(({ logger, scope, config, item, metadata, namespace, helpers }) => {

        item.buildProperties()
            .add('Privileged', config.spec?.allowPrivilegeEscalation, false)
            .add('Capabilities', config.spec?.allowedCapabilities)
            .add('seLinux', config.spec?.seLinux.rule)
            .add('RunAsUser', config.spec?.runAsUser.rule)
            .add('FSGroup', config.spec?.fsGroup.rule)
            .add('Groups', config.spec?.supplementalGroups.rule)
            .add('ReadOnlyRootFS', config.spec?.readOnlyRootFilesystem, false)
            .add('Volumes', config.spec?.volumes, [])
            .build()

    })
    ;
