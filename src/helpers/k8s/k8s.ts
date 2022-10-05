import _ from 'the-lodash';
import { ILogger } from "the-logger";
import { NodeKind } from '@kubevious/entity-meta';

import { K8sConfig, LogicItem, parseApiVersion } from "../..";

import { GlobalLabelMatcher } from './global-label-matcher';
import { GlobalOwnerReferenceDict } from './global-owner-reference-dict';

import { makeDn, RnInfo } from '../../utils/dn-utils';
import { ObjectMeta } from "kubernetes-types/meta/v1";
import { LogicScope } from '../../logic/scope';
import { PropsKind, PropsId } from '@kubevious/entity-meta';

import { K8sApiRegistry } from './api-registry';

export class KubernetesUtils {

    private _labelMatcher : GlobalLabelMatcher;
    private _scope: LogicScope;
    private _apiRegistry : K8sApiRegistry;
    private _ownerReferenceDict: GlobalOwnerReferenceDict;
    
    constructor(logger: ILogger, scope: LogicScope)
    {
        this._labelMatcher = new GlobalLabelMatcher(logger);
        this._ownerReferenceDict = new GlobalOwnerReferenceDict(logger, this);
        this._scope = scope;
        this._apiRegistry = new K8sApiRegistry(logger, scope);
    }

    get labelMatcher() {
        return this._labelMatcher;
    }

    get ownerReferenceDict() {
        return this._ownerReferenceDict;
    }

    get apiRegistry() {
        return this._apiRegistry;
    }
    
    config(item : LogicItem) : K8sConfig
    {
        const config = <K8sConfig>item.config;
        return config;
    }

    findItem(namespace: string | null, apiVersion: string, kind: string, name: string) : LogicItem | null
    {
        const dn = this.makeDn(namespace, apiVersion, kind, name);
        return this._scope.findItem(dn);
    }

    makeDn(namespace: string | null, apiVersion: string, kind: string, name: string)
    {
        const apiInfo = parseApiVersion(apiVersion);

        const parts : RnInfo[] = [
            { kind: NodeKind.root },
            { kind: NodeKind.k8s }
        ];

        if (namespace) {
            parts.push({ kind: NodeKind.ns, name: namespace! })
        } else {
            parts.push({ kind: NodeKind.cluster })
        }

        if (apiInfo.apiName) {
            parts.push({ kind: NodeKind.api, name: apiInfo.apiName })
        }

        parts.push({ kind: NodeKind.version, name: apiInfo.version })
        parts.push({ kind: NodeKind.kind, name: kind })
        parts.push({ kind: NodeKind.resource, name: name })
        
        return makeDn(parts);
    }

    labelsMap(metadata?: ObjectMeta)
    {
        return metadata?.labels ?? {};
    }

    annotationsMap(metadata?: ObjectMeta)
    {
        return metadata?.annotations ?? {};
    }

    makeConfigProps(item: LogicItem, config: K8sConfig)
    {            
        item.addProperties({
            kind: PropsKind.yaml,
            id: PropsId.config,
            config: config
        });
    }

    makeLabelsProps(item: LogicItem, config: any)
    {            
        let labels = this.labelsMap(config.metadata);
        labels = this._normalizeDict(labels);

        item.addProperties({
            kind: PropsKind.keyValue,
            id: PropsId.labels,
            config: labels
        });
    }

    makeAnnotationsProps(item: LogicItem, config: K8sConfig)
    {            
        let annotations = this.annotationsMap(config.metadata);
        annotations = this._normalizeDict(annotations);

        item.addProperties({
            kind: PropsKind.keyValue,
            id: PropsId.annotations,
            config: annotations
        });
    }
    
    private _normalizeDict(dict? : Record<string, any>) : Record<string, any>
    {
        dict = dict || {};

        const res : Record<string, any> = {};
        for(const key of _.sortBy(_.keys(dict)))
        {
            res[key] = dict[key];
        }
        return res;
    }
}   