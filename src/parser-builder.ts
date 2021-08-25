
import { ConcreteParserBuilder } from './processor/concrete/builder';
import { LogicParserBuilder } from './processor/logic/builder';
import { ScopeParserBuilder } from './processor/scope/builder';
import { K8sParserBuilder } from './processor/k8s/builder';

export function ConcreteParser() : ConcreteParserBuilder
{
    return new ConcreteParserBuilder();
}

export function K8sParser() : K8sParserBuilder
{
    return new K8sParserBuilder();
}

export function LogicParser() : LogicParserBuilder
{
    return new LogicParserBuilder();
}

export function ScopeParser() : ScopeParserBuilder
{
    return new ScopeParserBuilder();
}