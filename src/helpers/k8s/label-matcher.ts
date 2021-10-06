import { LabelSelector } from 'kubernetes-types/meta/v1';
import _ from 'the-lodash';
import { DumpWriter } from 'the-logger';
import { LogicItem } from '../..';

export type LabelMap = Record<string, string>;

export class LabelMatcher
{
    private _labels : { labels : LabelMap, target : LogicItem }[] = [];

    constructor()
    {
    }

    get allLabels() {
        return this._labels;
    }

    register(labels : LabelMap, target : LogicItem)
    {
        if (!labels) {
            labels = {};
        }
        this._labels.push({
            labels: labels,
            target: target
        });
    }

    matchSelector(selector: LabelSelector) : LogicItem[]
    {
        if (selector.matchLabels){
            return this.match(selector.matchLabels);
        }
        return this._labels.map(x => x.target);
    }

    match(selector: LabelMap) : LogicItem[]
    {
        let result : LogicItem[] = [];
        for(let item of this._labels)
        {
            if (labelsMatch(item.labels, selector))
            {
                result.push(item.target);
            }
        }
        return result;
    }

    debugOutputToFile(writer: DumpWriter)
    {
        for (let item of this._labels)
        {
            writer
                .write(`=> ${item.target.dn}`)
                .write(item.labels)
                .newLine();
        }
    }
}

function labelsMatch(labels: LabelMap, selector: LabelMap)
{
    for(let key of _.keys(selector)) {
        if (selector[key] != labels[key]) {
            return false;
        }
    }
    return true;
}

