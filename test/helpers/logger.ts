
import { setupLogger, LoggerOptions } from 'the-logger';



export function makeLogger(name: string) 
{
    const loggerOptions = new LoggerOptions()
        .enableFile(process.env.LOG_TO_FILE == 'true')
        .pretty(true)
        .path(`logs/${name}`)
        ;
    const logger = setupLogger(name, loggerOptions);

    return logger;
}
