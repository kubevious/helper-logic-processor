import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';

export default LogicParser()
    .target({
        path: [],
        subtree: true
    })
    .handler(({ logger, item, helpers }) => {

        {
            const links = item.resolveTargetLinks();
            if (links.length > 0) {
                const linksTable = helpers.common.tableBuilder()
                    .column('kind', 'Kind')
                    .column('dn', 'Application', 'shortcut')
                    .column('resolved', 'Resolved')
                ;
                for(const link of links)
                {
                    linksTable.row({ 
                        kind: link.link.kind, 
                        dn: link.dn, 
                        path: link.link.path,
                        resolved: _.isNotNullOrUndefined(link.item)
                    })
                }

                linksTable.order(['dn', 'kind', 'path']);
        
                item.addProperties({
                    kind: "table",
                    id: 'target-links',
                    title: 'Target Links',
                    order: 8,
                    config: linksTable.extract()
                }, {
                    isSelfProps: true
                });
            }
        }

        {
            const links = item.resolveSourceLinks();
            if (links.length > 0) {
                const linksTable = helpers.common.tableBuilder()
                    .column('kind', 'Kind')
                    .column('dn', 'Application', 'shortcut')
                    .column('resolved', 'Resolved')
                ;
                for(const link of links)
                {
                    linksTable.row({ 
                        kind: link.link.kind,
                        dn: link.dn,
                        path: link.link.path,
                        resolved: _.isNotNullOrUndefined(link.item)
                    })
                }

                linksTable.order(['dn', 'kind', 'path']);
        
                item.addProperties({
                    kind: "table",
                    id: 'source-links',
                    title: 'Source Links',
                    order: 9,
                    config: linksTable.extract()
                }, {
                    isSelfProps: true
                });
            }
        }

    })
    ;