import { PropertyValueWithUnit } from "../../helpers/resources";

export interface LogicContainerRuntime
{
    namespace: string;
    envVars: Record<string, string>;

    resourcesRequest: { [ metric: string] : PropertyValueWithUnit };
    resourcesLimit: { [ metric: string] : PropertyValueWithUnit };

}