import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';

export default LogicParser()
    .target({
        path: []
    })
    .handler(({ logger, item, config, runtime }) => {

        const images = item.fetchByNaming('images');
        
        // (<InfraNodesRuntime>nodes.runtime).poolCount = 0;
        // (<InfraNodesRuntime>nodes.runtime).nodeCount = 0;

    })
    ;
