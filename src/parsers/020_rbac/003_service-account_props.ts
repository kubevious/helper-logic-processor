import _ from 'the-lodash';
import { K8sServiceAccountParser } from '../../parser-builder/k8s';

export default K8sServiceAccountParser()
    .handler(({ logger, scope, config, item, metadata, namespace, runtime, helpers }) => {

        helpers.roles.produceItemSubjectRoleMatrix(item, runtime);

    })
    ;
