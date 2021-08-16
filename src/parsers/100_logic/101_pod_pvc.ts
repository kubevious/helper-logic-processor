import _ from 'the-lodash';
import { ScopeParser } from '../../parser-builder';

export default ScopeParser()
    .target({
        namespaced: true,
        scopeKind: 'Pod'
    })
    .handler(({ scope, itemScope }) => {

        let volumes = _.get(itemScope.config, 'spec.volumes');
        if (volumes)
        {
            for(let volume of volumes)
            {
                let pvcName = _.get(volume, 'persistentVolumeClaim.claimName');
                if (pvcName)
                {
                    let pvcScope = itemScope.parent.items.get('PersistentVolumeClaim', pvcName);
                    if (pvcScope)
                    {
                        for(let podItem of itemScope.items)
                        {
                            let pvc = podItem.fetchByNaming("pvc", pvcScope.name);
                            scope.setK8sConfig(pvc, pvcScope.config);
                            pvcScope.registerItem(pvc);
                            pvcScope.markUsedBy(pvc);
                        }
                    }     
                }
            }
        }

    })
    ;