import _ from 'the-lodash';
import { LogicImageParser } from '../../parser-builder/logic';

export default LogicImageParser()
    .handler(({ logger, scope, item, config, runtime }) => {

        const imagesRoot = scope.logicRootNode.fetchByNaming('images');

        const repoRoot = imagesRoot.fetchByNaming('repo', runtime.repository);

        const imageRoot = repoRoot.fetchByNaming('image', runtime.name);
        
        const tagRoot = imageRoot.fetchByNaming('tag', runtime.tag);

        const nsLinkItem = tagRoot.fetchByNaming('ns', runtime.namespace);

        const logicContainerItem = item.parent!;
        const logicAppItem = logicContainerItem.parent!;

        const appLinkItem = nsLinkItem.fetchByNaming('app', logicAppItem.naming);
        appLinkItem.makeShadowOf(logicAppItem);
        appLinkItem.link('image', item, `${logicContainerItem.kind}-${logicContainerItem.naming}`);

    })
    ;
