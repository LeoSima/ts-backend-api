/* istanbul ignore file */
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import config from "@AncientOne/config";
import logger from "@AncientOne/utils/logger";

mongoose.Promise = global.Promise;
mongoose.set("debug", process.env.DEBUG !== undefined);

const opcoes = {
    autoIndex: config.mongo.autoIndex,
    serverSelectionTimeoutMS: 5000, // Continua tentando enviar operações durante 5 segundos
    socketTimeoutMS: 45000 // Fecha sockets depois de 45 segundos de inatividade
};

class MongoConnection {
    private static _instancia: MongoConnection;
    private _servidorMongo?: MongoMemoryServer;

    static recuperaInstancia(): MongoConnection {
        if (!MongoConnection._instancia)
            MongoConnection._instancia = new MongoConnection();

        return MongoConnection._instancia;
    }

    public async abrir(): Promise<void> {
        try {
            if (config.mongo.url === "inmemory") {
                logger.debug("Conectando ao mongodb inmemory");
                this._servidorMongo = await MongoMemoryServer.create();

                const mongoUrl = this._servidorMongo.getUri();
                await mongoose.connect(mongoUrl, opcoes);
            } else {
                logger.debug("Conectando ao mongodb: " + config.mongo.url);
                mongoose.connect(config.mongo.url, opcoes);
            }

            mongoose.connection.on("connected", () => {
                logger.info("Mongo: conectado");
            });

            mongoose.connection.on("disconnecetd", () => {
                logger.error("Mongo: desconectado");
            });

            mongoose.connection.on("error", (err) => {
                logger.error(`Mongo: ${String(err)}`);

                if (err.name === "MongoNetworkError") {
                    setTimeout(() => {
                        mongoose.connect(config.mongo.url, opcoes).catch(() => { });
                    }, 5000);
                }
            });
        } catch (err) {
            logger.error(`db.open: ${err}`);
            throw err;
        }
    }

    public async fechar(): Promise<void> {
        try {
            await mongoose.disconnect();

            if (config.mongo.url === "inmemory")
                await this._servidorMongo!.stop();
        } catch (err) {
            logger.error(`db.open: ${err}`);
            throw err;
        }
    }
}

export default MongoConnection.recuperaInstancia();
