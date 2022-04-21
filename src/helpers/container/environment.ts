import _ from 'the-lodash';
import { NodeKind, ValidatorID } from "@kubevious/entity-meta/dist";
import { ConfigMap, ConfigMapEnvSource, ConfigMapKeySelector, Container, EnvVar, ObjectFieldSelector, ResourceFieldSelector, Secret, SecretEnvSource, SecretKeySelector } from "kubernetes-types/core/v1";
import { ILogger } from "the-logger";
import { Helpers } from "..";
import { LogicItem } from "../../logic/item";
import { LogicLinkKind } from "../../logic/link-kind";
import { LogicScope } from "../../logic/scope";
import { K8sConfig } from '../../types/k8s';
import { Quantity } from 'kubernetes-types/api/resource';

export class ContainerEnvironmentUtils {

    private _helpers: Helpers;
    private _logger: ILogger;
    private _scope : LogicScope;

    constructor(helpers: Helpers, logger: ILogger, scope: LogicScope)
    {
        this._helpers = helpers;
        this._logger = logger.sublogger('ContainerEnvironmentUtils');
        this._scope = scope;
    }
    
    extractEnvVars(item: LogicItem,
                   config: Container,
                   ownerConfig: K8sConfig,
                   allContainers: Container[],
                   inverseLinkName: string)
    {
        const processor = new EnvironmentVarsProcessor(
            this._logger,
            this._helpers,
            item,
            config,
            ownerConfig,
            allContainers,
            inverseLinkName);

        return processor.process();
    }
}

class EnvironmentVarsProcessor
{
    private _logger: ILogger;
    private _helpers: Helpers;
    private _item: LogicItem;
    private _ownerConfig: K8sConfig;
    private _config: Container;
    private _allContainers: Container[];
    private _inverseLinkName: string;
    private _namespace: string;

    private _envVars: Record<string, string | null> = {};

    constructor(logger: ILogger,
                helpers: Helpers,
                item: LogicItem,
                config: Container,
                ownerConfig: K8sConfig,
                allContainers: Container[],
                inverseLinkName: string)
    {
        this._logger = logger;
        this._helpers = helpers;
        this._item = item;
        this._ownerConfig = ownerConfig;
        this._config = config;
        this._inverseLinkName = inverseLinkName;
        this._allContainers = allContainers;
        this._namespace = ownerConfig.metadata.namespace!;
    }

    process() : Record<string, string | null>
    {
        this._processEnvVars();
        this._processEnvFrom();

        return this._envVars;
    }

    private _processEnvVars()
    {
        if (!this._config.env) {
            return;
        }

        for(const envVar of this._config.env)
        {
            if (envVar.value)
            {
                this._setValue(envVar.name, envVar.value);
            }
            else if (envVar.valueFrom)
            {
                if (envVar.valueFrom.configMapKeyRef)
                {
                    this.extractConfigMapRefEnvVar(envVar, envVar.valueFrom.configMapKeyRef);
                }
                else if (envVar.valueFrom.secretKeyRef)
                {
                    this.extractSecretRefEnvVar(envVar, envVar.valueFrom.secretKeyRef);
                }
                else if (envVar.valueFrom.resourceFieldRef)
                {
                    this.extractResourceRefEnvVar(envVar, envVar.valueFrom.resourceFieldRef);
                }
                else if (envVar.valueFrom.fieldRef)
                {
                    this.extractFieldRefEnvVar(envVar, envVar.valueFrom.fieldRef);
                }
                // envVar.valueFrom.configMapKeyRef
                // value = envVar.valueFrom;
                // value = "<pre>" + yaml.dump(envVar.valueFrom) + "</pre>";
            }

            // if (value) {
            //     runtime.envVars[envVar.name] = value;
            // }
        }
    }

    private extractConfigMapRefEnvVar(envVar: EnvVar, keyRef: ConfigMapKeySelector)
    {
        const configMapName = keyRef.name;
        if (!configMapName) {
            return;
        }

        const configMap = this._processConfigMap(configMapName);
        if (configMap)
        {
            if (configMap.data)
            {
                const dataValue = configMap.data[keyRef.key];
                if (!_.isUndefined(dataValue)) {
                    this._setValue(envVar.name, dataValue);
                    return;
                }
            }
        }

        if (!keyRef.optional) {
            this._raiseAlert(ValidatorID.MISSING_ENV_CONFIG_MAP, `Could not find ConfigMap ${configMapName}`);
        }
    }

    private extractSecretRefEnvVar(envVar: EnvVar, keyRef: SecretKeySelector)
    {
        const secretName = keyRef.name;
        if (!secretName) {
            return;
        }

        const secret = this._processSecret(secretName);
        if (secret)
        {
            if (secret.data)
            {
                const dataValue = secret.data[keyRef.key];
                if (!_.isUndefined(dataValue)) {
                    this._setValue(envVar.name, dataValue);
                    return;
                }
            }
        }

        if (!keyRef.optional) {
            this._raiseAlert(ValidatorID.MISSING_ENV_SECRET, `Could not find Secret ${secretName}`);
        }
    }

    private extractResourceRefEnvVar(envVar: EnvVar, keyRef: ResourceFieldSelector)
    {
        if (!keyRef.containerName) {
            return;
        }

        const container = _.find(this._allContainers, x => x.name === keyRef.containerName);
        const rawValue : Quantity = _.get(container?.resources ?? {}, keyRef.resource);
        const value = rawValue ?? '';
        this._setValue(envVar.name, value);
    }

    private extractFieldRefEnvVar(envVar: EnvVar, keyRef: ObjectFieldSelector)
    {
        const value = _.get(this._ownerConfig, keyRef.fieldPath) ?? '';
        this._setValue(envVar.name, value);
    }

    private _processEnvFrom()
    {
        if (!this._config.envFrom) {
            return;
        }

        for(const envFromObj of this._config.envFrom)
        {
            if (envFromObj.configMapRef)
            {
                this.extractConfigMapSource(envFromObj.configMapRef, envFromObj.prefix);
            }
            if (envFromObj.secretRef)
            {
                this.extractSecretSource(envFromObj.secretRef, envFromObj.prefix);
            }
        }
    }

    private extractConfigMapSource(envSource: ConfigMapEnvSource, prefix?: string)
    {
        const configMapName = envSource.name;
        if (configMapName)
        {
            const configMap = this._processConfigMap(configMapName);
            if (configMap)
            {
                if (configMap.data) {
                    for(const dataKey of _.keys(configMap.data)) {
                        const dataValue = configMap.data[dataKey];
                        const envName = prefix ? `${prefix}${dataKey}` : dataKey;
                        this._setValue(envName, dataValue);
                    }
                } else {
                    this._raiseAlert(ValidatorID.EMPTY_ENV_CONFIG_MAP, `ConfigMap has no data: ${configMapName}`);
                }
            }
            else
            {
                if (!envSource.optional) {
                    this._raiseAlert(ValidatorID.MISSING_ENV_CONFIG_MAP, `Could not find ConfigMap ${configMapName}`);
                }
            }
        }
    }

    private extractSecretSource(envSource: SecretEnvSource, prefix?: string)
    {
        const secretName = envSource.name;
        if (secretName)
        {
            const secret = this._processSecret(secretName);
            if (secret)
            {
                if (secret.data) {
                    for(const dataKey of _.keys(secret.data)) {
                        const dataValue = secret.data[dataKey];
                        const envName = prefix ? `${prefix}${dataKey}` : dataKey;
                        this._setValue(envName, dataValue);
                    }
                } else {
                    this._raiseAlert(ValidatorID.EMPTY_ENV_SECRET, `Secret has no data: ${secretName}`);
                }
            }
            else
            {
                if (!envSource.optional) {
                    this._raiseAlert(ValidatorID.MISSING_ENV_SECRET, `Could not find Secret ${secretName}`);
                }
            }
        }
    }

    private _processConfigMap(name: string) : ConfigMap | null
    {
        const k8sConfigMap = this._helpers.k8s.findItem(this._namespace, 'v1', 'ConfigMap', name);

        if (k8sConfigMap)
        {
            this._helpers.shadow.create(k8sConfigMap, this._item, 
                {
                    kind: NodeKind.configmap,
                    linkName: LogicLinkKind.k8s,
                    inverseLinkName: LogicLinkKind.env,
                    inverseLinkPath: this._inverseLinkName // TODO: Example: `${runtime.app}-${this._item.naming}`,
                })

            return <ConfigMap>k8sConfigMap.config;
        }
        
        return null;
    }

    private _processSecret(name: string) : Secret | null
    {
        const k8sSecret = this._helpers.k8s.findItem(this._namespace, 'v1', 'Secret', name);

        if (k8sSecret)
        {
            this._helpers.shadow.create(k8sSecret, this._item, 
                {
                    kind: NodeKind.secret,
                    linkName: LogicLinkKind.k8s,
                    inverseLinkName: LogicLinkKind.env,
                    inverseLinkPath: this._inverseLinkName // TODO: Example: `${runtime.app}-${this._item.naming}`,
                })

            return <Secret>k8sSecret.config;
        }
        
        return null;
    }
    
    private _setValue(envName: string, value: string | null)
    {
        this._envVars[envName] = value;
    }
    
    private _raiseAlert(validator: ValidatorID, msg: string)
    {
        this._item.raiseAlert(validator, msg);
    }
}   