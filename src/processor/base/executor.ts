import { LogicScope } from "../../logic/scope";

export interface BaseParserExecutor 
{
    name: string;
    kind: string;
    targetInfo: string;

    execute(scope : LogicScope) : void;
}