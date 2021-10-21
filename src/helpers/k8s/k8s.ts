import _ from 'the-lodash';
import { ILogger } from "the-logger";

import { K8sConfig, LogicItem, parseApiVersion } from "../..";

import { GlobalLabelMatcher } from './global-label-matcher';

import { makeDn, RnInfo } from '../../utils/dn-utils';
import { ObjectMeta } from "kubernetes-types/meta/v1";
import { LogicScope } from '../../logic/scope';

export class KubernetesUtils {

    private _labelMatcher : GlobalLabelMatcher;
    private _scope: LogicScope;
    
    constructor(logger: ILogger, scope: LogicScope)
    {
        this._labelMatcher = new GlobalLabelMatcher(logger);
        this._scope = scope;
    }

    get labelMatcher() {
        return this._labelMatcher;
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

        const parts : (RnInfo | string)[] = ['root', 'k8s'];

        if (namespace) {
            parts.push({ kind: "ns", name: namespace! })
        } else {
            parts.push({ kind: "cluster" })
        }

        if (apiInfo.apiName) {
            parts.push({ kind: "api", name: apiInfo.apiName })
        }

        parts.push({ kind: "version", name: apiInfo.version })
        parts.push({ kind: "kind", name: kind })
        parts.push({ kind: "resource", name: name })
        
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
            kind: "yaml",
            id: "config",
            title: "Config",
            order: 10,
            config: config
        });
    }

    makeLabelsProps(item: LogicItem, config: any)
    {            
        let labels = this.labelsMap(config.metadata);
        labels = this._normalizeDict(labels);

        item.addProperties({
            kind: "key-value",
            id: "labels",
            title: "Labels",
            order: 8,
            config: labels
        });
    }

    makeAnnotationsProps(item: LogicItem, config: K8sConfig)
    {            
        let annotations = this.annotationsMap(config.metadata);
        annotations = this._normalizeDict(annotations);

        item.addProperties({
            kind: "key-value",
            id: "annotations",
            title: "Annotations",
            order: 9,
            config: annotations
        });
    }
    
    private _normalizeDict(dict? : Record<string, any>) : Record<string, any>
    {
        dict = dict || {};

        let res : Record<string, any> = {};
        for(let key of _.sortBy(_.keys(dict)))
        {
            res[key] = dict[key];
        }
        return res;
    }
}   