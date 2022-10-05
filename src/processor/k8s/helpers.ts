import { NodeKind } from "@kubevious/entity-meta";
import { LogicTarget, LogicTargetPathElement, LogicTargetQuery } from "../../logic/scope";
import { K8sTarget } from "./builder";

export function makeLogicTargetPath(k8sTarget: K8sTarget) : LogicTargetPathElement[]
{
    const targetPath : LogicTargetPathElement[] = [
        { query: LogicTargetQuery.node, kind: NodeKind.k8s },
    ]

    if (k8sTarget.clustered)
    { 
        targetPath.push({ query: LogicTargetQuery.node, kind: NodeKind.cluster });
    }
    else
    {
        targetPath.push({ query: LogicTargetQuery.node, kind: NodeKind.ns });
    }

    if (k8sTarget.api)
    {
        targetPath.push({ query: LogicTargetQuery.node, kind: NodeKind.api, name: k8sTarget.api });
    }

    if (k8sTarget.version)
    {
        targetPath.push({ query: LogicTargetQuery.node, kind: NodeKind.version, name: k8sTarget.version });
    } else {
        targetPath.push({ query: LogicTargetQuery.node, kind: NodeKind.version });
    }

    targetPath.push({ query: LogicTargetQuery.node, kind: NodeKind.kind, name: k8sTarget.kind });

    targetPath.push({ query: LogicTargetQuery.node, kind: NodeKind.resource });

    return targetPath;
}


export function makeLogicTarget(k8sTarget: K8sTarget) : LogicTarget
{
    const logicTarget: LogicTarget = { 
        path: makeLogicTargetPath(k8sTarget) 
    };
    
    return logicTarget;
}