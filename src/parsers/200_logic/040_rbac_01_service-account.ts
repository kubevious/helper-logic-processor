import _ from 'the-lodash';
import { LogicLauncherParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';
import { ValidatorID } from '@kubevious/entity-meta';

export default LogicLauncherParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        if (!runtime.podTemplateSpec?.spec) {
            return;
        }

        const origSvcAccountName = 
            runtime.podTemplateSpec?.spec.serviceAccountName ||
            runtime.podTemplateSpec?.spec.serviceAccount;

        
        const hasAccountNameSet = origSvcAccountName ? true : false;
        if (!hasAccountNameSet)
        {
            item.raiseAlert(ValidatorID.UNSET_SERVICE_ACCOUNT, 'Service account is not set.');
        }

        const svcAccountName = hasAccountNameSet ? origSvcAccountName : 'default';

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
                if (hasAccountNameSet) {
                    item.raiseAlert(ValidatorID.MISSING_CONTAINER_TO_SERVICE_ACCOUNT, `Service account ${svcAccountName} is not found.`);
                }
            }
        }

    })
    ;
