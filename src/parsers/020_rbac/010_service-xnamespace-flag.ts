import _ from 'the-lodash';
import { K8sServiceAccountParser } from '../../parser-builder/k8s';

export default K8sServiceAccountParser()
    .handler(({ logger, scope, config, item, metadata, namespace, runtime, helpers }) => {

        for(const rule of _.values(runtime.rules))
        {
            for(const ruleItem of rule.items)
            {
                if (ruleItem.namespace)
                {
                    if (ruleItem.namespace !== namespace!)
                    {
                        item.setPropagatableFlag("xnamespace");
                    }
                }
            }
        }
        
    })
    ;
