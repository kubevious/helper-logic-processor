
import { ConcreteParserBuilder } from '../processor/concrete/builder';
import { LogicParserBuilder } from '../processor/logic/builder';
import { K8sParserBuilder } from '../processor/k8s/builder';

import { K8sConfig } from '../';

export function ConcreteParser() : ConcreteParserBuilder
{
    return new ConcreteParserBuilder();
}

export function K8sParser<TConfig = K8sConfig, TRuntime = {}>() : K8sParserBuilder<TConfig, TRuntime>
{
    return new K8sParserBuilder<TConfig, TRuntime>();
}

export function LogicParser<TConfig = {}, TRuntime = {}>() : LogicParserBuilder<TConfig, TRuntime>
{
    return new LogicParserBuilder<TConfig, TRuntime>();
}
