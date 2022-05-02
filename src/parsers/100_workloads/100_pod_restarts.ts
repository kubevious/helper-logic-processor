import { PropsId, PropsKind } from '@kubevious/entity-meta';
import { PodHealthConfig } from '@kubevious/entity-meta/dist/props-config/pod-health';
import _ from 'the-lodash';
import { K8sPodParser } from '../../parser-builder/k8s';
import { BucketAggregator } from '../../utils/bucket-aggregator';

export default K8sPodParser()
    .handler(({ config, item, runtime, scope, logger }) => {

        runtime.restartCount = 0;

        const containerStatuses = config.status?.containerStatuses ?? [];
        for(const containerStatus of containerStatuses)
        {
            runtime.restartCount += containerStatus.restartCount;
        }

        const storeValue = item.getFromStore<RestartCountHistory>(STORE_KEY_RESTARTS, { entries: [] });
        if (!storeValue.entries) {
            storeValue.entries = [];
        }

        const aggregator = new BucketAggregator(scope.date, runtime.restartCount);
        for(const item of storeValue.entries)
        {
            aggregator.add(item.date, item.count);
        }
        runtime.restartCountBucket = aggregator.produceBuckets();

        {
            storeValue.entries = aggregator.getItems();
            item.saveToStore(STORE_KEY_RESTARTS, storeValue);
        }

        const podHealth : PodHealthConfig = {
            restarts: runtime.restartCountBucket
        }

        item.addProperties({
            id: PropsId.health,
            kind: PropsKind.podHealth, 
            config: podHealth
        });
        
    })
    ;


interface RestartCountHistory
{
    entries: RestartCountEntry[];
}
interface RestartCountEntry
{
    date: string,
    count: number
}

const STORE_KEY_RESTARTS = 'restarts';