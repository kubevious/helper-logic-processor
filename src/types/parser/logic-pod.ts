export interface LogicPodRuntime
{
    namespace: string;
    app: string;

    radioactiveProps: { [ kind : string ] : boolean };
}