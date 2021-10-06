import { PropertyValueWithUnit } from "../../helpers/resources";

export interface InfraPoolRuntime
{
    nodeCount: number;

    resourcesAllocatable: { [ metric: string] : PropertyValueWithUnit };
    resourcesCapacity: { [ metric: string] : PropertyValueWithUnit };

    nodeResources: { [ metric: string] : PropertyValueWithUnit };
}