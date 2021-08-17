
export interface K8sConfig {
    synthetic?: boolean,
    apiVersion: string,
    kind: string,
    metadata: {
        name: string,
        namespace?: string,
        [x: string]: any,
    },
    spec?: any,
    status?: any,
    data?: any,
    [x: string]: any
}

export interface K8sApiInfo
{
    namespaced: boolean,
    apiName?: string,
    version: string
    kind: string
}