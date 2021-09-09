import { PropertyValueWithUnit } from "../../helpers/resources";

export interface LogicNamespaceRuntime
{
    namespace: string;

    usedResources: { [ metric: string] : PropertyValueWithUnit };
    clusterConsumption: { [ metric: string] : PropertyValueWithUnit };

    appsByConsumptionDict : { [ dn: string ] : { dn: string, max: number, metrics: { [ metric: string] : number } } };
}