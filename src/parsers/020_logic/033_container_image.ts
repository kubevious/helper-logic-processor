import _ from 'the-lodash';
import { LogicParser } from '../../parser-builder';

export default LogicParser()
    .only()
    .target({
        path: ["logic", "ns", "app", "launcher", "cont"]
    })
    .target({
        path: ["logic", "ns", "app", "launcher", "initcont"]
    })
    .handler(({ logger, item, helpers}) => {

        const config = helpers.k8s.container(item);

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
