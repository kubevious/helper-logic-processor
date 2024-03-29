import { ObjectMeta } from "kubernetes-types/meta/v1";
import { TraefikServiceReference } from "./traefik-service";

export interface IngressRoute
{
    apiVersion: string;
    kind: string;
    metadata: ObjectMeta;
    spec?: {
        entryPoints?: string[];
        routes?: IngressRouteConfig[];
        tls?: TraefikIngressRouteTLS;
    }
}

export interface IngressRouteConfig
{
    kind: "Rule",
    match: string,
    middlewares?: TraefikMiddlewareReference[],
    services?: IngressRouteServiceConfig[],
}

export interface IngressRouteServiceConfig extends TraefikServiceReference
{
    
}

export interface TraefikMiddlewareReference
{
    name: string,
    namespace?: string,
}

export interface TraefikIngressRouteTLS
{
    secretName?: string;
    options?: {
        name?: string;
        namespace?: string;
    },
    certResolver? : string;
    domains: {
        main?: string; 
        sans?: string[]; 
    }[]
}   