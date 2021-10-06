
import { setupLogger, LoggerOptions, LogLevel } from 'the-logger';



export function makeLogger(name: string) 
{
    const loggerOptions = new LoggerOptions()
        .enableFile(process.env.LOG_TO_FILE == 'true')
        .pretty(true)
        .path(`logs/${name}`)
        .level(LogLevel.info)
        .subLevel("LogicProcessor", LogLevel.info)
        .subLevel("LogicParser", LogLevel.debug)
        ;

    const logger = setupLogger(name, loggerOptions);

    return logger;
}
