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
            const k8sSvcAccountDn = helpers.k8s.makeDn(runtime.namespace, 'v1', 'ServiceAccount', svcAccountName);

            const app = item.parent!;
            const k8sSvcAccount = app.link('service-account', k8sSvcAccountDn);
            if (k8sSvcAccount)
            {
                helpers.usage.register(app, k8sSvcAccount);

                const svcAccount = app.fetchByNaming(NodeKind.svcaccnt, svcAccountName);
                svcAccount.makeShadowOf(k8sSvcAccount);
                svcAccount.link('k8s-owner', k8sSvcAccount);
            }
            else
            {
                item.addAlert('Missing', 'error', `Service account ${svcAccountName} is not found.`);
            }
        }

    })
    ;
