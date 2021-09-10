import _ from 'the-lodash';
import { LogicContainerParser } from '../../parser-builder/logic';

export default LogicContainerParser()
    .handler(({ logger, item, config, helpers}) => {

        const fullImage = config.image;

        if (!fullImage) {
            return;
        }
            
        let image : string;
        let imageTag : string;
        let i = fullImage.indexOf(':');
        let repository = 'docker';
        if (i != -1) {
            imageTag = fullImage.substring(i + 1);
            image = fullImage.substring(0, i);
        } else {
            imageTag = 'latest';
            image = fullImage;
        }

        let imageName = image;
        i = image.lastIndexOf('/');
        if (i != -1) {
            repository = image.substring(0, i);
            imageName = image.substring(i + 1);
        }

        const imageItem = item.fetchByNaming("image", image);

        imageItem.buildProperties()
            .add('name', imageName)
            .add('tag', imageTag)
            .add('fullName', fullImage)
            .add('repository', repository)
            .build();

    })
    ;
