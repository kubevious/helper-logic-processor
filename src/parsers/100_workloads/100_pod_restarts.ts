import { PropsId, PropsKind } from '@kubevious/entity-meta/dist';
import _ from 'the-lodash';
import { K8sPodParser } from '../../parser-builder/k8s';
import { BucketAggregator } from '../../utils/bucket-aggregator';

export default K8sPodParser()
    .handler(({ config, item, runtime, scope, }) => {

        runtime.restartCount = 0;

        const containerStatuses = config.status?.containerStatuses ?? [];
        for(const containerStatus of containerStatuses)
        {
            runtime.restartCount += containerStatus.restartCount;
        }

        const aggregator = new BucketAggregator(scope.date, runtime.restartCount);
        aggregator.add(config.metadata?.creationTimestamp ?? new Date(), 0);

        runtime.restartCountBucket = aggregator.produceBuckets();

        const podHealth = {
            restarts: runtime.restartCountBucket
        }

        item.addProperties({
            id: PropsId.health,
            kind: PropsKind.podHealth, 
            config: podHealth
        });
        
    })
    ;
