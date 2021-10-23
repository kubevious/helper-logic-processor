import _ from 'the-lodash';
import { LogicLauncherParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        if (!config.spec) {
            return;
        }

        const origSvcAccountName = 
            config.spec?.template.spec?.serviceAccountName ||
            config.spec?.template.spec?.serviceAccount;

        if (!origSvcAccountName)
        {
            item.addAlert('Missing', 'warn', 'Service account is not set.');
        }

        const svcAccountName = origSvcAccountName || 'default';

        if (svcAccountName)
        {
            const k8sSvcAccount = helpers.k8s.findItem(runtime.namespace, 'v1', 'ServiceAccount', svcAccountName);

            const app = item.parent!;
            if (k8sSvcAccount)
            {
                helpers.shadow.create(k8sSvcAccount, app, 
                    {
                        kind: NodeKind.svcaccnt,
                        linkName: 'k8s',
                        inverseLinkName: 'logic',
                        inverseLinkPath: runtime.app
                    })

                k8sSvcAccount.link('app', app, app.naming);
            }
            else
            {
                item.addAlert('Missing', 'error', `Service account ${svcAccountName} is not found.`);
            }
        }

    })
    ;
