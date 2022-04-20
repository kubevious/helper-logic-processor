import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

export default LogicParser()
    .survivesBreakpoint()
    .target({
        path: [],
        subtree: true
    })
    .handler(({ logger, item, helpers }) => {

        {
            const links = item.resolveTargetLinks();
            if (links.length > 0) {

                const linksMap : { [ kind : string ] : LinkInfo[] } = {};

                for(const link of links)
                {
                    if (!linksMap[link.link.kind]) {
                        linksMap[link.link.kind] = [];
                    }

                    linksMap[link.link.kind].push(
                        {
                            dn: link.dn, 
                            path: link.link.path,
                            unresolved: _.isNullOrUndefined(link.item) ? true : undefined
                        });
                }

                for(const key of _.keys(linksMap))
                {
                    linksMap[key] = _.orderBy(linksMap[key], ['dn', 'path']);
                }
        
                item.addProperties({
                    kind: PropsKind.links,
                    id: PropsId.targetLinks,
                    config: linksMap
                }, {
                    isSelfProps: true
                });
            }
        }

        // {
        //     const links = item.resolveSourceLinks();
        //     if (links.length > 0) {
        //         const linksTable = helpers.common.tableBuilder()
        //             .column('kind', 'Kind')
        //             .column('dn', 'Application', 'shortcut')
        //             .column('resolved', 'Resolved')
        //         ;
        //         for(const link of links)
        //         {
        //             linksTable.row({ 
        //                 kind: link.link.kind,
        //                 dn: link.dn,
        //                 path: link.link.path,
        //                 resolved: _.isNotNullOrUndefined(link.item)
        //             })
        //         }

        //         linksTable.order(['dn', 'kind', 'path']);
        
        //         item.addProperties({
        //             kind: "table",
        //             id: 'source-links',
        //             config: linksTable.extract()
        //         }, {
        //             isSelfProps: true
        //         });
        //     }
        // }

    })
    ;

interface LinkInfo 
{
    dn: string,
    path?: string;
    unresolved?: boolean;
}