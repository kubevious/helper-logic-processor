import { PropertyValueWithUnit } from "../../helpers/resources";
import { LogicCommonWorkload } from './logic-common';

export interface LogicAppRuntime extends LogicCommonWorkload
{
    launcherKind: string;
    launcherReplicas: number | null;

    containerCount: number;
    initContainerCount: number;

    perPodResources: { [ metric: string] : PropertyValueWithUnit };
    usedResources: { [ metric: string] : PropertyValueWithUnit };
    clusterConsumption: { [ metric: string] : PropertyValueWithUnit };

    volumes: Record<string, string>;

    hpa?: { min: number, max: number };

    ingresses : { [dn: string] : boolean};

    exposedWithService: boolean;
    exposedWithIngress: boolean;

    ports: { [nameOrNumber : string] : PortInfo };

    helmCharts: { [ dn: string] : boolean };
}

export interface PortInfo
{
    name: string | undefined,
    containerName: string,
    portDn: string,
    containerDn: string
}