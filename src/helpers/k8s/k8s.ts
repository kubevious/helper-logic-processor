import { ILogger } from "the-logger";

import { K8sConfig, LogicItem, parseApiVersion } from "../..";

import { GlobalLabelMatcher } from './global-label-matcher';

import { makeDn, RnInfo } from '../../utils/dn-utils';

export class KubernetesUtils {

    private _labelMatcher : GlobalLabelMatcher;
    
    constructor(logger: ILogger)
    {
        this._labelMatcher = new GlobalLabelMatcher(logger);
    }

    get labelMatcher() {
        return this._labelMatcher;
    }
    
    config(item : LogicItem) : K8sConfig
    {
        const config = <K8sConfig>item.config;
        return config;
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
    
}   