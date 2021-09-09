import { PropertyValueWithUnit } from "../../helpers/resources";

export interface InfraNodesRuntime
{
    poolCount: number;
    nodeCount: number;

    clusterResources: { [ metricCounterType: string] : PropertyValueWithUnit };
    nodeResources: { [ metric: string] : PropertyValueWithUnit };
}