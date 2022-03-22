import _ from 'the-lodash';
import { RbacGroupOrUserParser } from '../../parser-builder/rbac';

export default RbacGroupOrUserParser()
    .handler(({ logger, scope, config, item, runtime, helpers }) => {

        helpers.roles.produceItemSubjectRoleMatrix(item, runtime);

    })
    ;
