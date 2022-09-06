import _ from 'the-lodash';
import { ILogger } from "the-logger";
import { K8sApiResourceStatusConfig, K8sApiResourceStatusLoader } from '@kubevious/entity-meta';

import { extractK8sConfigId, IConcreteRegistry, K8sConfig } from "../..";

import { LogicScope } from '../../logic/scope';


export class K8sApiRegistry {

    private logger: ILogger;
    private _scope: LogicScope;

    private _loader? : K8sApiResourceStatusLoader;
    
    constructor(logger: ILogger, scope: LogicScope)
    {
        this.logger = logger;
        this._scope = scope;
    }

    initialize(registry : IConcreteRegistry)
    {
        const apiStatusId = extractK8sConfigId(API_RESOURCE_STATUS_SAMPLE);

        const apiResourceStatusObj = registry.findItem(apiStatusId);

        if (!apiResourceStatusObj) {
            this.logger.error("[K8sApiRegistry::initialize] Missing ApiResourceStatus");
            return;
        }

        const k8sApiResourceStatusConfig = (apiResourceStatusObj as any) as K8sApiResourceStatusConfig;
        try
        {
            this._loader = new K8sApiResourceStatusLoader(k8sApiResourceStatusConfig);
        }
        catch(reason)
        {
            this.logger.error("[K8sApiRegistry::initialize] ", reason);
        }
    }

    postProcessConfig(config: K8sConfig) : K8sConfig
    {
        if (this._loader)
        {
            const resourceStatus = this._loader.getByApiVersionAndKind(config.apiVersion, config.kind);
            if (resourceStatus)
            {
                if (resourceStatus.isNamespaced)
                {
                    if (!config.metadata?.namespace)
                    {
                        if (!config.metadata) {
                            config.metadata = {}
                        }
                        config.metadata.namespace = 'default';
                    }
                }
            }
        }

        return config;
    }

}

const API_RESOURCE_STATUS_SAMPLE : K8sConfig = {
    apiVersion: 'kubevious.io/v1',
    kind: 'ApiResourceStatus',
    metadata: {
        name: 'default'
    },
    synthetic: true
}