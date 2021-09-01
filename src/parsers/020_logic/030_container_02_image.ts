import { Container } from 'kubernetes-types/core/v1';
import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';

export default LogicParser<Container>()
    .target({
        path: ["logic", "ns", "app", "cont"]
    })
    .target({
        path: ["logic", "ns", "app", "initcont"]
    })
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

        let imageItem = item.fetchByNaming("image", image);

        imageItem.addProperties({
            kind: "key-value",
            id: "properties",
            title: "Properties",
            order: 10,
            config: {
                name: imageName,
                tag: imageTag,
                fullName: fullImage,
                repository: repository
            }
        });  

    })
    ;
