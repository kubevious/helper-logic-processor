import { ObjectMeta } from "kubernetes-types/meta/v1";

export interface IngressRoute
{
    apiVersion: string;
    kind: string;
    metadata: ObjectMeta;
    spec?: {
        entryPoints?: string[];
        routes?: IngressRouteConfig[]
    }
}

export interface IngressRouteConfig
{
    kind: "Rule",
    match: string,
    middlewares?: {
        name: string,
        namespace?: string
    }[],
    services?: {
        name: string,
        kind?: "Service" | "TraefikService",
        port?: number | string
    }[],
}