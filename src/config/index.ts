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
    loggerLevel: LogLevel,
    localCacheTtl: number,
    mongo: {
        url: string,
        useCreateIndex: boolean,
        autoIndex: boolean
    },
    privateKeyFile: string,
    privateKeyPassphrase: string,
    publicKeyFile: string
}

const config: Config = {
    ambienteAtual: parsedEnv.AMBIENTE_ATUAL as string,
    port: parsedEnv.PORT as number,
    morganLogger: parsedEnv.MORGAN_LOGGER as boolean,
    morganBodyLogger: parsedEnv.MORGAN_BODY_LOGGER as boolean,
    tsDevLogger: parsedEnv.TS_DEV_LOGGER as boolean,
    loggerLevel: parsedEnv.LOGGER_LEVEL as LogLevel,
    localCacheTtl: parsedEnv.LOCAL_CACHE_TTL as number,
    mongo: {
        url: parsedEnv.MONGO_URL as string,
        useCreateIndex: parsedEnv.MONGO_CREATE_INDEX as boolean,
        autoIndex: parsedEnv.MONGO_AUTO_INDEX as boolean
    },
    privateKeyFile: parsedEnv.PRIVATE_KEY_FILE as string,
    privateKeyPassphrase: parsedEnv.PRIVATE_KEY_PASSPHRASE as string,
    publicKeyFile: parsedEnv.PUBLIC_KEY_FILE as string,
};

export default config;
