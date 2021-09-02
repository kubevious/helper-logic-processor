import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { TableBuilder } from '../../table-builder';

export default LogicParser()
    .target({
        path: []
    })
    .handler(({ logger, item }) => {

        {
            const links = item.resolveTargetLinks();
            if (links.length > 0) {
                let linksTable = new TableBuilder()
                    .column('kind', 'Kind')
                    .column('dn', 'Application', 'shortcut')
                    .column('resolved', 'Resolved')
                ;
                for(let link of links)
                {
                    linksTable.row({ kind: link.link.kind, dn: link.dn, resolved: _.isNotNullOrUndefined(link.item) })
                }
        
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
                let linksTable = new TableBuilder()
                    .column('kind', 'Kind')
                    .column('dn', 'Application', 'shortcut')
                    .column('resolved', 'Resolved')
                ;
                for(let link of links)
                {
                    linksTable.row({ kind: link.link.kind, dn: link.dn, resolved: _.isNotNullOrUndefined(link.item) })
                }
        
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