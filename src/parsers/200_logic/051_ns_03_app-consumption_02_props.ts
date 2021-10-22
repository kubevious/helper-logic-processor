import _ from 'the-lodash';
import { LogicNamespaceParser } from '../../parser-builder/logic'
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicNamespaceParser()
    .handler(({ logger, scope, item, config, runtime, helpers }) => {

        const appsByConsumptionTable = {
            headers: <any[]>[
                {
                    id: 'dn',
                    label: 'Application',
                    kind: 'shortcut'
                }
            ],
            rows: <any[]>[]
        }

        for(const metric of helpers.resources.METRICS) {
            appsByConsumptionTable.headers.push(metric);
        }
        
        appsByConsumptionTable.rows = _.orderBy(_.values(runtime.appsByConsumptionDict), x => x.max, 'desc').map(x => {
            const row : Record<string, any> = {
                dn: x.dn
            }
            for(const metric of helpers.resources.METRICS)
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
            kind: PropsKind.table,
            id: PropsId.appConsumption,
            config: appsByConsumptionTable
        });


    })
    ;
