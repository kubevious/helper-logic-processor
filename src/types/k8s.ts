import { ObjectMeta } from "kubernetes-types/meta/v1";

export interface K8sConfig {
    synthetic?: boolean,
    apiVersion: string,
    kind: string,
    metadata: ObjectMeta,
    // {
    //     name: string,
    //     namespace?: string,
    //     [x: string]: any,
    // },
    spec?: any,
    status?: any,
    data?: any,
    [x: string]: any
}

export interface K8sApiInfo
{
    apiName?: string,
    version: string
}

export interface K8sApiResourceInfo extends K8sApiInfo
{
    namespaced: boolean,
    kind: string
}