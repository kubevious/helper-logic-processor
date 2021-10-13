import _ from 'the-lodash';
import { IConcreteRegistry, LogicProcessor } from '../..';

import { BaseParserInfo, BaseParserBuilder, ParserBuilder } from '../base/builder';
import { BaseParserExecutor } from '../base/executor';

import { K8sProcessorHandlerArgs } from './handler-args';
import { K8sParserExecutor } from './executor';

export interface K8sTarget {
    api?: string,
    version?: string,
    kind: string,
    clustered?: boolean
}

export interface K8sParserInfo<TConfig, TRuntime> extends BaseParserInfo
{
    target?: K8sTarget;
    handler? : (args : K8sProcessorHandlerArgs<TConfig, TRuntime>) => void;
}

export class K8sParserBuilder<TConfig, TRuntime> extends BaseParserBuilder<K8sTarget> implements ParserBuilder
{
    private _data : K8sParserInfo<TConfig, TRuntime> = {
        targetKind: 'k8s'
    };

    target(value : K8sTarget)
    {
        this._targets.push(value);
        return this;
    }

    handler(value : (args : K8sProcessorHandlerArgs<TConfig, TRuntime>) => void)
    {
        this._data.handler = value;
        return this;
    }

    _extract(registry: IConcreteRegistry, processor : LogicProcessor, name: string) : BaseParserExecutor[]
    {
        return this._targets.map(target => {
            const parserInfo = _.clone(this._data);
            parserInfo.target = target;

            const executor = new K8sParserExecutor(
                processor,
                name,
                parserInfo,
                this.isTraceEnabled(),
                this.isDnTraceEnabled.bind(this)
                )

            return executor;
        });
    }

}
