import moment from 'moment';

import { BucketKeys, HistogramBucket } from '@kubevious/entity-meta/dist/props-config/histogram-bucket';

export class BucketAggregator
{
    private _date: moment.Moment;
    private _latestValue: number;
    private _values : Item[] = [];

    constructor(date: string | Date, latestValue: number)
    {
        this._date = moment(date);
        this._latestValue = latestValue;

        this.add(date, latestValue);
    }

    loadItems(items: BucketStorageItem[])
    {
        for(const item of items)
        {
            this.add(item.date, item.value);
        }
    }

    exportItems() : BucketStorageItem[]
    {
        return this._values.map(x => ({
            date: x.date.toISOString(),
            value: x.value
        }));
    }

    add(date: string | Date, value: number)
    {
        const myMoment = moment(date);
        const duration = moment.duration(this._date.diff(myMoment));
        const diffSec = duration.asSeconds();

        if (diffSec > BUCKET_1_DAY) {
            return;
        }

        this._values.push({
            date: myMoment,
            value: value,
            diffSec: diffSec
        });
    }

    produceBuckets() : HistogramBucket
    {
        const data : HistogramBucket = {
            [BucketKeys.BUCKET_15_MINS]: 0,
            [BucketKeys.BUCKET_1_HR]: 0,
            [BucketKeys.BUCKET_8_HRS]: 0,
            [BucketKeys.BUCKET_1_DAY]: 0,
        }

        for(const item of this._values)
        {
            const deltaV = this._latestValue - item.value;

            if (item.diffSec <= BUCKET_15_MINS) {
                data[BucketKeys.BUCKET_15_MINS] += deltaV;
            }
            if (item.diffSec <= BUCKET_1_HR) {
                data[BucketKeys.BUCKET_1_HR] += deltaV;
            }
            if (item.diffSec <= BUCKET_8_HRS) {
                data[BucketKeys.BUCKET_8_HRS] += deltaV;
            }
            data[BucketKeys.BUCKET_1_DAY] += deltaV;
        }

        return data;
    }
}

export interface BucketStorageItem
{
    date: string;
    value: number;
}

interface Item
{
    date: moment.Moment;
    value: number;
    diffSec: number;
}

const BUCKET_15_MINS = 15 * 60;
const BUCKET_1_HR = 1 * 60 * 60;
const BUCKET_8_HRS = 8 * 60 * 60;
const BUCKET_1_DAY = 25 * 60 * 60;
