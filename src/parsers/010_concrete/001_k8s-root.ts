import _ from 'the-lodash';
import { ConcreteParser } from '../../parser-builder';
import { NodeKind } from '@kubevious/entity-meta';
import { PropsKind, PropsId, K8sApiResourceStatus } from '@kubevious/entity-meta';

export default ConcreteParser()
    .target({
        synthetic: true,
        apiName: 'kubevious.io',
        kind: 'ApiResourceStatus'
    })
    .handler(({ logger, scope, item, helpers }) => {

        const infraRoot = scope.logicRootNode.fetchByNaming(NodeKind.infra);

        const root = infraRoot.fetchByNaming(NodeKind.k8s);

        root.addProperties({
            kind: PropsKind.yaml,
            id: PropsId.config,
            config: item.config
        });

        const apiTable = helpers.common.tableBuilder()
            .column('api', 'API')
            .column('version')
            .column('kind')
            .column('state')
        ;

        let resources = _.get(item.config, 'config.resources') as K8sApiResourceStatus[] || []; 
        resources = _.orderBy(resources, [x => x.apiName ?? '', x => x.apiVersion, x => x.kindName]);

        for (const resource of resources)
        {
            const statusItems : string[] = [];
            if (resource.isDisconnected) {
                statusItems.push('disconnected');
            }
            if (resource.isDisabled) {
                statusItems.push('disabled');
            }
            if (resource.isSkipped) {
                statusItems.push('skipped');
            }

            apiTable.row({
                api: resource.apiName ?? undefined,
                version: resource.version,
                kind: resource.kindName,
                state: statusItems.join(', '),
            })
        }

        root.addProperties({
            kind: PropsKind.table,
            id: PropsId.resources,
            config: apiTable.extract()
        });
    })
    ;