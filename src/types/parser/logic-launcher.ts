export interface LogicLauncherRuntime
{
    namespace: string;
    app: string;

    radioactiveProps: { [ kind : string ] : boolean };
}