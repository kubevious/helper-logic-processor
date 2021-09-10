export interface LogicPodRuntime
{
    namespace: string;

    radioactiveProps: { [ kind : string ] : boolean };
}