import 'mocha';
import should = require('should');

import { makeLogger } from './helpers/logger';
import moment from 'moment';

import { BucketAggregator } from '../src/utils/bucket-aggregator';
import { BucketKeys } from '@kubevious/entity-meta/dist/props-config/histogram-bucket';

const logger = makeLogger('empty');

describe('bucket-aggregator', () => {

    it('case-empty', () => {
      
        const aggregator = new BucketAggregator(new Date(), 50);
        const bucket = aggregator.produceBuckets();
        logger.info("bucket: ", bucket);

        should(bucket.total).be.equal(50);
        should(bucket[BucketKeys.BUCKET_15_MINS]).be.equal(0);
        should(bucket[BucketKeys.BUCKET_1_HR]).be.equal(0);
        should(bucket[BucketKeys.BUCKET_8_HRS]).be.equal(0);
        should(bucket[BucketKeys.BUCKET_1_DAY]).be.equal(0);

        const storeItems = aggregator.getItems();
        logger.info("storeItems: ", storeItems);

        should(storeItems).be.an.Array().and.lengthOf(1);
        should(storeItems[0]!.count).be.equal(50);
    })
    ;

    it('case-history', () => {
      
        const lastRestartCount = 94;
        const entries : { date: string, count: number }[] = [];

        const lastDate = moment();
        let date = lastDate.clone();

        for(let i = 0; i < 70; i++)
        {
            entries.push({ date: date.toISOString(), count: lastRestartCount - i });
            date = date.subtract(30, 'seconds');
        }

        const aggregator = new BucketAggregator(lastDate.toISOString(), 95);
        for(const item of entries)
        {
            aggregator.add(item.date, item.count);
        }
        const bucket = aggregator.produceBuckets();
        logger.info("bucket: ", bucket);

        should(bucket.total).be.equal(95);
        should(bucket[BucketKeys.BUCKET_15_MINS]).be.equal(31);
        should(bucket[BucketKeys.BUCKET_1_HR]).be.equal(70);
        should(bucket[BucketKeys.BUCKET_8_HRS]).be.equal(70);
        should(bucket[BucketKeys.BUCKET_1_DAY]).be.equal(70);

        const storeItems = aggregator.getItems();

        should(storeItems).be.an.Array().and.lengthOf(71);

    })
    ;

});
