import { K8sApiResourceStatus } from '@kubevious/entity-meta';
import _ from 'the-lodash';
import { ILogger } from "the-logger";

import { extractK8sConfigId, IConcreteRegistry, K8sConfig } from "../..";

import { LogicScope } from '../../logic/scope';


export class K8sApiRegistry {

    private logger: ILogger;
    private _scope: LogicScope;

    private _apiDict : { [apiVersion: string] : { [kind: string] : K8sApiResourceStatus }} = {};
    
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

        const apiResources = apiResourceStatusObj.config?.resources as K8sApiResourceStatus[];
        if (!apiResources) {
            this.logger.error("[K8sApiRegistry::initialize] Empty ApiResourceStatus resources");
            return;
        }

        for(const apiResource of apiResources)
        {
            if (!this._apiDict[apiResource.apiVersion]) {
                this._apiDict[apiResource.apiVersion] = {};
            }
            this._apiDict[apiResource.apiVersion][apiResource.kindName] = apiResource;
        }
    }

    postProcessConfig(config: K8sConfig) : K8sConfig
    {
        if (this._apiDict[config.apiVersion])
        {
            const apiResource = this._apiDict[config.apiVersion][config.kind];
            if (apiResource)
            {
                if (apiResource.isNamespaced)
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