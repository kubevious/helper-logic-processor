import { ILogger } from 'the-logger';

import { RoleHelper } from './roles'
import { UsageUtils } from './usage'
import { ResourceHelpers } from './resources'
import { CommonUtils } from './common';
import { KubernetesUtils } from './k8s/k8s';
import { GatewayUtils } from './gateway';
import { LogicUtils } from './logic';
import { LogicScope } from '../logic/scope';

export class Helpers {

    public roles : RoleHelper = new RoleHelper();
    public resources : ResourceHelpers = new ResourceHelpers();
    public common : CommonUtils = new CommonUtils();
    public k8s : KubernetesUtils;
    public gateway: GatewayUtils;
    public logic: LogicUtils;
    public usage: UsageUtils;

    constructor(logger: ILogger, scope: LogicScope)
    {
        this.usage = new UsageUtils(logger, scope);
        this.k8s = new KubernetesUtils(logger);
        this.gateway = new GatewayUtils(logger, scope);
        this.logic = new LogicUtils(logger, scope);
    }
}