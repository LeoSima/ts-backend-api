import dotenvExtended from 'dotenv-extended';
import dotenvParseVariables from 'dotenv-parse-variables';
 
const env = dotenvExtended.load();
const parsedEnv = dotenvParseVariables(env);

type LogLevel = "silent" | "error" | "warn" | "info" | "http" | "verbose" | "debug" | "silly";
 
interface Config {
    ambienteAtual: string,
    port: number,
    morganLogger: boolean,
    morganBodyLogger: boolean,
    tsDevLogger: boolean,
    loggerLevel: LogLevel
}

const config: Config = {
    ambienteAtual: parsedEnv.AMBIENTE_ATUAL as string,
    port: parsedEnv.PORT as number,
    morganLogger: parsedEnv.MORGAN_LOGGER as boolean,
    morganBodyLogger: parsedEnv.MORGAN_BODY_LOGGER as boolean,
    tsDevLogger: parsedEnv.TS_DEV_LOGGER as boolean,
    loggerLevel: parsedEnv.LOGGER_LEVEL as LogLevel
};

export default config;
