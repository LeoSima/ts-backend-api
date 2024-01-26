/* istanbul ignore file */
import db from "@AncientOne/utils/db";
import config from "@AncientOne/config";
import logger from "@AncientOne/utils/logger";
import { criarServidor } from "./utils/servidor";

db.abrir()
    .then(() => criarServidor())
    .then(servidor => {
        servidor.listen(config.port, () => {
            logger.info(`Listening on http://localhost:${config.port}`);
        });
    })
    .catch(erro => {
        logger.error(`Erro: ${erro}`);
    });
