import { PropertyValueWithUnit } from "../../helpers/resources";

export interface InfraPoolRuntime
{
    nodeCount: number;

    poolResources: { [ metricCounterType: string] : PropertyValueWithUnit };
    nodeResources: { [ metric: string] : PropertyValueWithUnit };
}