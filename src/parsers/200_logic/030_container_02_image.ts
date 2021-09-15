import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';
import { LogicImageRuntime } from '../../types/parser/logic-image';
import { parseImageString } from '../../utils/image-naming';

export default LogicContainerParser()
    .handler(({ logger, item, config, helpers, runtime }) => {

        const fullImage = config.image;

        if (!fullImage) {
            return;
        }
            
        const imageInfo = parseImageString(fullImage);

        const imageItem = item.fetchByNaming("image", imageInfo.imagePath);
        const imgRuntime = <LogicImageRuntime>imageItem.runtime;
        imgRuntime.namespace = runtime.namespace;
        imgRuntime.fullImage = fullImage;
        imgRuntime.repository = imageInfo.repository;
        imgRuntime.name = imageInfo.name;
        imgRuntime.tag = imageInfo.tag;

        imageItem.buildProperties()
            .add('name', imgRuntime.name)
            .add('tag', imgRuntime.tag)
            .add('fullName', imgRuntime.fullImage)
            .add('repository', imgRuntime.repository)
            .build();

    })
    ;
