import { ILogger } from 'the-logger';

import { RoleHelper } from './roles'
import { ResourceHelpers } from './resources'
import { CommonUtils } from './common';
import { KubernetesUtils } from './k8s/k8s';
import { GatewayUtils } from './gateway';
import { LogicScope } from '../logic/scope';

export class Helpers {

    public roles : RoleHelper = new RoleHelper();
    public resources : ResourceHelpers = new ResourceHelpers();
    public common : CommonUtils = new CommonUtils();
    public k8s : KubernetesUtils;
    public gateway: GatewayUtils;

    constructor(logger: ILogger, scope: LogicScope)
    {
        this.k8s = new KubernetesUtils(logger);
        this.gateway = new GatewayUtils(logger, scope);
    }
}