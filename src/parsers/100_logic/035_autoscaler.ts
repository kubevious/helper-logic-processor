import _ from 'the-lodash';
import { ConcreteParser } from '../../parser-builder';

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
        let scaleTargetRef = _.get(item.config, 'spec.scaleTargetRef');
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
            let rawContainer = scope.fetchRawContainer(item, "Autoscalers");
            createK8sItem(rawContainer);
            createAlert('MissingApp', 'error', 'Could not find apps matching scaleTargetRef.');
            return;
        }

        let min = item.config.spec.minReplicas;
        let max = item.config.spec.maxReplicas;
        let replicasInfo = "[" + min + ", " + max + "]";

        createK8sItem(app);

        let appProps = appScope.properties;
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