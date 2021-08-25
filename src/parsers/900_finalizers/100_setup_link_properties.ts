import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';
import { TableBuilder } from '../../table-builder';

export default LogicParser()
    .only()
    .target({
        path: []
    })
    .handler(({ logger, item }) => {

        const links = item.getAllLinks();
        if (links.length == 0) {
            return;
        }

        let linksTable = new TableBuilder()
            .column('kind', 'Kind')
            .column('dn', 'Application', 'shortcut')
        ;
        for(let link of links)
        {
            linksTable.row({ kind: link.kind, dn: link.target.dn })
        }

        item.addProperties({
            kind: "table",
            id: 'links',
            title: 'Links',
            order: 8,
            config: linksTable.extract()
        });

    })
    ;