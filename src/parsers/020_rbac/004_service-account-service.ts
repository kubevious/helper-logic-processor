import { ValidatorID } from '@kubevious/entity-meta/dist';
import _ from 'the-lodash';
import { LogicLinkKind } from '../../logic/link-kind';
import { K8sServiceAccountParser } from '../../parser-builder/k8s';

export default K8sServiceAccountParser()
    .handler(({ logger, scope, config, item, metadata, namespace, runtime, helpers }) => {

        if (!config.secrets) {
            return;
        }

        for(const secretRef of config.secrets)
        {
            const ns = secretRef.namespace ?? namespace;

            const secretDn = helpers.k8s.makeDn(
                ns,
                secretRef.apiVersion ?? 'v1',
                secretRef.kind ?? 'Secret',
                secretRef.name ?? '');

            const secret = item.link(LogicLinkKind.secret, secretDn);
            if (secret)
            {
                const linkNamingParts = [
                    config.kind,
                    metadata.namespace,
                    metadata.name
                ];
                const linkNaming = _.filter(linkNamingParts, x => x).map(x => x!).join('::');
    
                secret.link(LogicLinkKind.svcaccount, item, linkNaming);
            }
            else
            {
                item.raiseAlert(ValidatorID.MISSING_SVC_ACCOUNT_SECRET, `Could not find Secret ${ns} :: ${secretRef.name}.`);
            }
    
        }
        
    })
    ;
