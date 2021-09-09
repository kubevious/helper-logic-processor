import { PropertyValueWithUnit } from "../../helpers/resources";

export interface LogicAppRuntime
{
    namespace: string;

    launcherKind: string;
    launcherReplicas: number;

    perPodResources: Record<string, PropertyValueWithUnit>;
    usedResources: Record<string, PropertyValueWithUnit>;

    volumes: Record<string, string>;
}