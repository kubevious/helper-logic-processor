import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic'
import { LogicAppRuntime } from '../../types/parser/logic-app';

export default LogicNamespaceParser()
    .handler(({ logger, scope, item, config, runtime, helpers }) => {

        runtime.appsByConsumptionDict = {};

        for(let app of item.getChildrenByKind('app')) 
        {
            const appRuntime = <LogicAppRuntime>app.runtime;

            if (!runtime.appsByConsumptionDict[app.dn]) {
                runtime.appsByConsumptionDict[app.dn] = {
                    dn: app.dn,
                    max: 0,
                    metrics: {}
                }
            }

            for(let metric of helpers.resources.METRICS)
            {
                let value = appRuntime.clusterConsumption[metric]?.value || 0;
                runtime.appsByConsumptionDict[app.dn].metrics[metric] = value;
            }
        }

        for(let appConsumption of _.values(runtime.appsByConsumptionDict))
        {
            for(let metric of helpers.resources.METRICS)
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
