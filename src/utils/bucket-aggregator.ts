import _ from 'the-lodash';
import moment from 'moment';

import { BucketKeys, HistogramBucket } from '@kubevious/entity-meta/dist/props-config/histogram-bucket';

export class BucketAggregator
{
    private _date: moment.Moment;
    private _latestValue: number;
    private _values : Item[] = [];

    private _bucket : HistogramBucket = {
        [BucketKeys.BUCKET_15_MINS]: 0,
        [BucketKeys.BUCKET_1_HR]: 0,
        [BucketKeys.BUCKET_8_HRS]: 0,
        [BucketKeys.BUCKET_1_DAY]: 0,
        [BucketKeys.BUCKET_TOTAL]: 0,
    };


    constructor(date: string | Date, latestValue: number)
    {
        this._date = moment(date);
        this._latestValue = latestValue;
        this._bucket[BucketKeys.BUCKET_TOTAL] = latestValue;

        this.add(date, latestValue);
    }

    getItems() : BucketStorageItem[]
    {
        return this._values.map(x => ({
            date: x.date.toISOString(),
            count: x.value
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
        this._values = _.orderBy(this._values, x => x.date, ['desc']);
        // console.log("VALUES: ", this._values);

        if (this._values.length === 0) {
            this._addToBucket({
                date: moment(),
                value: 0,
                diffSec: 0
            })

        } else {
            for(const item of this._values)
            {
                this._addToBucket(item);
                this._latestValue = item.value;
            }
        }

        return this._bucket;
    }

    private _addToBucket(item: Item)
    {
        const deltaV = this._latestValue - item.value;
        // console.log("item.value: ", item.value);
        // console.log("this._latestValue: ", this._latestValue);
        // console.log("deltaV: ", deltaV);
        // console.log("item.diffSec: ", item.diffSec);

        if (item.diffSec <= BUCKET_15_MINS) {
            this._bucket[BucketKeys.BUCKET_15_MINS] += deltaV;
        }
        if (item.diffSec <= BUCKET_1_HR) {
            this._bucket[BucketKeys.BUCKET_1_HR] += deltaV;
        }
        if (item.diffSec <= BUCKET_8_HRS) {
            this._bucket[BucketKeys.BUCKET_8_HRS] += deltaV;
        }
        this._bucket[BucketKeys.BUCKET_1_DAY] += deltaV;
    }
}

export interface BucketStorageItem
{
    date: string;
    count: number;
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
