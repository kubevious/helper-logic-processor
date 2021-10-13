import _ from 'the-lodash';
import { LogicImageParser } from '../../parser-builder/logic';
import { NodeKind } from '@kubevious/entity-meta';

export default LogicImageParser()
    .handler(({ logger, scope, item, config, runtime }) => {

        const imagesRoot = scope.logicRootNode.fetchByNaming(NodeKind.images);

        const repoRoot = imagesRoot.fetchByNaming(NodeKind.repo, runtime.repository);

        const imageRoot = repoRoot.fetchByNaming(NodeKind.image, runtime.name);
        
        const tagRoot = imageRoot.fetchByNaming(NodeKind.tag, runtime.tag);

        const nsLinkItem = tagRoot.fetchByNaming(NodeKind.ns, runtime.namespace);

        const logicContainerItem = item.parent!;
        const logicAppItem = logicContainerItem.parent!;

        const appLinkItem = nsLinkItem.fetchByNaming(NodeKind.app, logicAppItem.naming);
        appLinkItem.makeShadowOf(logicAppItem);
        appLinkItem.link('image', item, `${logicContainerItem.kind}-${logicContainerItem.naming}`);

    })
    ;
