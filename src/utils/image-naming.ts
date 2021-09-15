

export function parseImageString(fullImage: string) : ImageInfo
{
    const imageTagInfo = splitImageTag(fullImage);
    const repoInfo = splitRepo(imageTagInfo.imagePath);

    return {
        fullImage: fullImage,
        imagePath: imageTagInfo.imagePath,
        repository: repoInfo.repo,
        name: repoInfo.path,
        tag: imageTagInfo.tag
    }
}

export function splitRepo(imagePath: string) : ImageRepoInfo
{
    const re = /^([^\/]+\.[^\/]+)\/(\S+)$/i;
    const matches = imagePath.match(re);

    if (matches) {
        return { 
            repo: matches[1],
            path: matches[2]
        }
    }

    return {
        repo: 'dockerhub',
        path: imagePath
    }
}

export function splitImageTag(fullImage: string) : ImageTagParseInfo
{
    const re = /^(\S+):([^\/]+)$/i;
    const matches = fullImage.match(re);

    if (matches) {
        return { 
            imagePath: matches[1],
            tag: matches[2]
        }
            
    }

    return { 
        imagePath: fullImage,
        tag: 'latest'
    }
}

export interface ImageRepoInfo
{
    repo: string;
    path: string;
}

export interface ImageTagParseInfo
{
    imagePath: string;
    tag: string;
}


export interface ImageInfo
{
    fullImage: string;
    imagePath: string;
    repository: string;
    name: string;
    tag: string;
}