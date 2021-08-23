import { LogicScope } from "../../scope";

export interface BaseParserExecutor 
{
    name: string;
    kind: string;
    targetInfo: string;

    execute(scope : LogicScope) : void;
}