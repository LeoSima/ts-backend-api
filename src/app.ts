import config from "@TildaSwanton/config";
import logger from "@TildaSwanton/utils/logger";
import { criarServidor } from "./utils/servidor";

criarServidor()
    .then(servidor => {
        servidor.listen(config.port, () => {
            logger.info(`Listening on http://localhost:${config.port}`);
        });
    })
    .catch(erro => {
        logger.error(`Erro: ${erro}`);
    });
