import _ from 'the-lodash';
import { ConcreteParser } from '../parser-builder';

const yaml = require('js-yaml');

export default ConcreteParser()
    .order(35)
    .target({
        api: "autoscaling",
        kind: "HorizontalPodAutoscaler"
    })
    .kind('hpa')
    .needAppScope(true)
    .appNameCb((item) => {
        var scaleTargetRef = _.get(item.config, 'spec.scaleTargetRef');
        if (!scaleTargetRef) {
            return null;
        }
        return scaleTargetRef.name;
    })
    .handler(({ scope, item, createK8sItem, createAlert, appName, app, appScope }) => {
        if (!appName) {
            return null;
        }

        // TODO: replace with appScope or app
        if (!appScope) {
            var rawContainer = scope.fetchRawContainer(item, "Autoscalers");
            createK8sItem(rawContainer);
            createAlert('MissingApp', 'error', 'Could not find apps matching scaleTargetRef.');
            return;
        }

        var min = item.config.spec.minReplicas;
        var max = item.config.spec.maxReplicas;
        var replicasInfo = "[" + min + ", " + max + "]";

        createK8sItem(app);

        var appProps = appScope.properties;
        if (_.isNotNullOrUndefined(appProps['Replicas']))
        {
            appProps['Replicas'] += " " + replicasInfo;
        } 
        else 
        {
            appProps['Replicas'] = replicasInfo;
        }
    })
    ;