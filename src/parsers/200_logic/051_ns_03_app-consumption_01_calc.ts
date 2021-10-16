import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic'
import { LogicAppRuntime } from '../../types/parser/logic-app';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicNamespaceParser()
    .handler(({ logger, scope, item, config, runtime, helpers }) => {

        runtime.appsByConsumptionDict = {};

        for(const app of item.getChildrenByKind(NodeKind.app)) 
        {
            const appRuntime = <LogicAppRuntime>app.runtime;

            if (!runtime.appsByConsumptionDict[app.dn]) {
                runtime.appsByConsumptionDict[app.dn] = {
                    dn: app.dn,
                    max: 0,
                    metrics: {}
                }
            }

            for(const metric of helpers.resources.METRICS)
            {
                const value = appRuntime.clusterConsumption[metric]?.value || 0;
                runtime.appsByConsumptionDict[app.dn].metrics[metric] = value;
            }
        }

        for(const appConsumption of _.values(runtime.appsByConsumptionDict))
        {
            for(const metric of helpers.resources.METRICS)
            {
                if (_.isNullOrUndefined(appConsumption.metrics[metric]))
                {
                    appConsumption.metrics[metric] = 0;
                }
            }
            appConsumption.max = _.max(helpers.resources.METRICS.map(metric => appConsumption.metrics[metric]))!;
        }
       

    })
    ;
