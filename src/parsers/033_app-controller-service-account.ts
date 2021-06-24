import _ from 'the-lodash';
import { LogicItem } from '../item';
import { LogicParser } from '../parser-builder';

const yaml = require('js-yaml');

export default LogicParser()
    .order(33)
    .target({
        path: ["ns", "app", "launcher"]
    })
    .needNamespaceScope(true)
    .handler(({ item, namespaceScope }) => {

        let app = item.parent!;
        let appScope = app.appScope;

        let name = _.get(item.config, 'spec.template.spec.serviceAccountName');
        if (!name) {
            name = _.get(item.config, 'spec.template.spec.serviceAccount');
        }

        if (!name) {
            name = 'default';
        }
        
        if (name)
        {
            let serviceAccountScope = namespaceScope.items.get('ServiceAccount', name);
            if (serviceAccountScope) {
                serviceAccountScope.registerOwnerItem(app);
            } else {
                app.addAlert('Missing', 'error', 'Service account ' + name + ' is not found.');
            }
        }
        else
        {
            app.addAlert('Missing', 'warn', 'Service account is not set.');
        }

    })
    ;

