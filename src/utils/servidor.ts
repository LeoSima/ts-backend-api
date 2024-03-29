import bodyParser from "body-parser";
import express from "express";
import * as OpenApiValidator from "express-openapi-validator";
import { Express } from "express-serve-static-core";
import morgan from "morgan";
import morganBody from "morgan-body";
import { connector, summarise } from "swagger-routes-express";
import YAML from "yamljs";

import * as api from "@AncientOne/api/controllers";
import config from "@AncientOne/config";
import logger from "@AncientOne/utils/logger";
import { expressDevLogger } from "@AncientOne/utils/express_dev_logger";

export async function criarServidor(): Promise<Express> {
    const yamlSpecFile = "./config/openapi.yml";
    const definicaoApi = YAML.load(yamlSpecFile);
    const sumarioApi = summarise(definicaoApi);

    logger.info(sumarioApi);

    const servidor = express();

    servidor.use(bodyParser.json());

    /* istanbul ignore next */
    if (config.morganLogger)
        servidor.use(morgan(":method :url :status :response-time ms - :res[content-length]"));

    /* istanbul ignore next */
    if (config.morganBodyLogger)
        morganBody(servidor);

    /* istanbul ignore next */
    if (config.tsDevLogger)
        servidor.use(expressDevLogger);
    
    const opcoesValidador = {
        apiSpec: yamlSpecFile,
        validateRequests: true,
        validateResponses: true
    };

    servidor.use(OpenApiValidator.middleware(opcoesValidador));
    servidor.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(err.status).json({
            error: {
                type: "validacao_request",
                message: err.message,
                errors: err.errors
            }
        });
    });

    const conectar = connector(api, definicaoApi, {
        onCreateRoute: (metodo: string, descricao: any[]) => {
            logger.verbose(`${metodo}: ${descricao[0]}: ${(descricao[1] as any).name}`);
        },
        security: {
            bearerAuth: api.auth
        }
    });

    conectar(servidor);

    return servidor;
}
