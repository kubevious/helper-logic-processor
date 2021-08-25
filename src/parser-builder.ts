
import { ConcreteParserBuilder } from './processor/concrete/builder';
import { LogicParserBuilder } from './processor/logic/builder';
import { ScopeParserBuilder } from './processor/scope/builder';
import { K8sParserBuilder } from './processor/k8s/builder';

import { K8sConfig } from '.';

export function ConcreteParser() : ConcreteParserBuilder
{
    return new ConcreteParserBuilder();
}

export function K8sParser<TConfig = K8sConfig>() : K8sParserBuilder<TConfig>
{
    return new K8sParserBuilder<TConfig>();
}

export function LogicParser() : LogicParserBuilder
{
    return new LogicParserBuilder();
}

export function ScopeParser() : ScopeParserBuilder
{
    return new ScopeParserBuilder();
}