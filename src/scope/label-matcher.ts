import _ from 'the-lodash';

export class LabelMatcher<T>
{
    private _labels : { labels : any, target : T }[] = [];

    constructor()
    {
    }

    register(labels : Record<string, any>, target : T)
    {
        if (!labels) {
            labels = {};
        }
        this._labels.push({
            labels: labels,
            target: target
        });
    }

    match(selector: Record<string, any>) : T[]
    {
        let result : T[] = [];
        for(let item of this._labels)
        {
            if (labelsMatch(item.labels, selector))
            {
                result.push(item.target);
            }
        }
        return result;
    }
}

function labelsMatch(labels: Record<string, any>, selector: Record<string, any>)
{
    for(var key of _.keys(selector)) {
        if (selector[key] != labels[key]) {
            return false;
        }
    }
    return true;
}

