import { ObjectMeta } from "kubernetes-types/meta/v1";

export interface TraefikService
{
    apiVersion: string;
    kind: string;
    metadata: ObjectMeta;
    spec?: {
        weighted?: TraefikServiceWeighted;
        mirroring?: TraefikServiceMirroring;
    }
}

export interface TraefikServiceWeighted 
{
    services?: TraefikServiceWeightedService[];
}
export interface TraefikServiceWeightedService extends TraefikServiceReference
{
    weight?: number;
}

export interface TraefikServiceMirroring extends TraefikServiceReference
{
    mirrors?: TraefikServiceMirror[];
}
export interface TraefikServiceMirror extends TraefikServiceReference
{
    percent?: number;
}

export interface TraefikServiceReference
{
    name: string,
    kind?: "Service" | "TraefikService",
    port?: number | string
}
