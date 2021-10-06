import _ from 'the-lodash';
import { ConcreteParser } from '../../parser-builder';

export default ConcreteParser()
    .target({
        apiName: "apps",
        kind: "Deployment"
    })
    .target({
        apiName: "apps",
        kind: "DaemonSet"
    })
    .target({
        apiName: "apps",
        kind: "StatefulSet"
    })
    .target({
        apiName: "batch",
        kind: "Job"
    })
    .needAppScope(true)
    .canCreateAppIfMissing(true)
    .appNameCb((item) => {
        return item.config.metadata.name; 
    })
    .handler(({ scope, item, app, appScope, namespaceScope }) => {

        app.associateAppScope(appScope);

        let labelsMap = _.get(item.config, 'spec.template.metadata.labels');
        if (labelsMap) {
            namespaceScope.registerAppScopeLabels(appScope, labelsMap);
        }

        let launcher = app.fetchByNaming("launcher", item.config.kind);
        scope.setK8sConfig(launcher, item.config);
        namespaceScope.registerAppOwner(launcher);
        launcher.associateAppScope(appScope);

        appScope.properties['Launcher'] = item.config.kind;

        if (item.config.kind == "Deployment" || 
            item.config.kind == "StatefulSet")
        {
            appScope.properties['Replicas'] = _.get(item.config, 'spec.replicas');
        }

        app.addProperties({
            kind: "key-value",
            id: "properties",
            title: "Properties",
            order: 5,
            config: appScope.properties
        });  

        app.addProperties(launcher.getProperties('labels'));

    })
    ;