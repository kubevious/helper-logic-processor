import { LogicItem } from "../../logic/item";

export interface PackageNamespaceRuntime
{
    helm: { [ chart: string] : LogicItem };
}