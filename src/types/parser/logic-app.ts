import { PropertyValueWithUnit } from "../../helpers/resources";

export interface LogicAppRuntime
{
    namespace: string;

    launcherKind: string;
    launcherReplicas: number | null;

    containerCount: number;
    initContainerCount: number;

    perPodResources: { [ metric: string] : PropertyValueWithUnit };
    usedResources: { [ metric: string] : PropertyValueWithUnit };
    clusterConsumption: { [ metric: string] : PropertyValueWithUnit };

    volumes: Record<string, string>;

    hpa?: { min: number, max: number };
}