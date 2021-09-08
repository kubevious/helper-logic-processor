import _ from 'the-lodash';
import { LogicLauncherParser } from '../../parser-builder/logic';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        if (!config.spec) {
            return;
        }

        const svcAccountName = 
            config.spec?.template.spec?.serviceAccountName ||
            config.spec?.template.spec?.serviceAccount || 
            'default';

        if (!svcAccountName) {
            return;
        }

        const app = item.parent!;
        if (svcAccountName)
        {
            const k8sSvcAccountDn = helpers.k8s.makeDn(runtime.namespace, 'v1', 'ServiceAccount', svcAccountName);

            const k8sSvcAccount = app.link('service-account', k8sSvcAccountDn);
            if (k8sSvcAccount)
            {
                const svcAccount = app.fetchByNaming('svcaccnt', svcAccountName);
                svcAccount.makeShadowOf(k8sSvcAccount);
                svcAccount.link('k8s-owner', k8sSvcAccount);
            }
            else
            {
                // app.addAlert('Missing', 'error', 'Service account ' + name + ' is not found.');
            }
        }
        else
        {
            // app.addAlert('Missing', 'warn', 'Service account is not set.');
        }

    })
    ;
