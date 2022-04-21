import _ from 'the-lodash';
import { NodeKind } from '@kubevious/entity-meta';
import { LogicServiceAccountParser } from '../../parser-builder/logic';
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { LogicLinkKind } from '../../logic/link-kind';

export default LogicServiceAccountParser()
    .handler(({ logger, item, config, runtime, helpers}) => {

        const app = item.parent!;
        const appRuntime = <LogicAppRuntime>app.runtime;
        
        const k8sSvcAccount = item.resolveTargetLinkItem(LogicLinkKind.k8s)!;

        for(const k8sSecret of k8sSvcAccount.resolveTargetLinkItems(LogicLinkKind.secret))
        {
            helpers.shadow.create(k8sSecret, item, 
                {
                    kind: NodeKind.secret,
                    linkName: LogicLinkKind.k8s,
                    inverseLinkName: LogicLinkKind.logic,
                    inverseLinkPath: `${appRuntime.namespace}::${app.naming}`
                })
                
            k8sSecret.link(LogicLinkKind.app, app, `${appRuntime.namespace}::${app.naming}`);
        }

    })
    ;
