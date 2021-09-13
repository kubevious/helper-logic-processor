import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic'

export default LogicNamespaceParser()
    .handler(({ logger, scope, item, config, runtime, helpers }) => {

        let appsByConsumptionTable = {
            headers: <any[]>[
                {
                    id: 'dn',
                    label: 'Application',
                    kind: 'shortcut'
                }
            ],
            rows: <any[]>[]
        }

        for(let metric of helpers.resources.METRICS) {
            appsByConsumptionTable.headers.push(metric);
        }
        
        appsByConsumptionTable.rows = _.orderBy(_.values(runtime.appsByConsumptionDict), x => x.max, 'desc').map(x => {
            let row : Record<string, any> = {
                dn: x.dn
            }
            for(let metric of helpers.resources.METRICS)
            {
                let value = x.metrics[metric];
                if (!value) {
                    value = 0;
                }
                row[metric] = {
                    value: value,
                    unit: '%'
                };
            }
            return row;
        });

        item.addProperties({
            kind: "table",
            id: "app-consumption",
            title: "Application Consumption",
            order: 8,
            config: appsByConsumptionTable
        });


    })
    ;
