import { PropertyValueWithUnit } from "../../helpers/resources";

export interface InfraNodeRuntime
{
    resourcesAllocatable: { [ metric: string] : PropertyValueWithUnit };
    resourcesCapacity: { [ metric: string] : PropertyValueWithUnit };
}