/* istanbul ignore file */
import * as redis from "redis";

import config from "@AncientOne/config";
import logger from "@AncientOne/utils/logger";

class Cache {
    private static _instancia: Cache;
    private _client?: ReturnType<typeof redis.createClient>;
    private _conexaoInicial: boolean;

    private constructor() {
        this._conexaoInicial = true;
    }

    public static recuperaInstancia(): Cache {
        if (!Cache._instancia)
            Cache._instancia = new Cache();

        return Cache._instancia;
    }

    public abrir(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._client = redis.createClient({url: config.redisUrl});
            const client = this._client!;

            client.on("connect", () => {
                logger.info("Redis: conectado");
            });

            client.on("ready", () => {
                if (this._conexaoInicial) {
                    this._conexaoInicial = false;
                    resolve();
                }

                logger.info("Redis: pronto");
            });

            client.on("reconnecting", () => {
                logger.info("Redis: reconectando");
            });

            client.on("end", () => {
                logger.info("Redis: fim");
            });

            client.on("disconnected", () => {
                logger.info("Redis: desconectado");
            });

            client.on("error", function(err: any) {
                logger.error(`Redis: erro: ${err}`);
            });
    
            this._client.connect();
        });
    }

    public fechar(): Promise<void> {
        return new Promise((resolve) => {
            this._client!.quit()
                .then(() => resolve());
        });
    }

    public async setPropriedade(key: string, valor: string, expiraEm: number): Promise<void> {
        const resultado = await this._client!.set(key, valor, {EX: expiraEm}).catch(() => {
            throw new Error("Erro na conexão com o Redis");
        });

        if (!resultado)
            throw new Error("Erro na conexão com o Redis");
    }
    
    public async getPropriedade(key: string): Promise<string|null> {
        const resultado = await this._client!.get(key).catch(() => {
            throw new Error("Erro na conexão com o Redis");
        });

        return resultado;
    }
}

export default Cache.recuperaInstancia();
