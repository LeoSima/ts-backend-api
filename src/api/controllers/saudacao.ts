import * as express from "express";
import { writeJsonResponse } from "@AncientOne/utils/express";
import SaudacaoService from "@AncientOne/api/services/saudacao";
import logger from "@AncientOne/utils/logger";

export function ola(req: express.Request, res: express.Response): void {
    const nome = req.query.nome || "estranho";
    writeJsonResponse(res, 200, {"mensagem": `Olá, ${nome}!`});
}

export function adeus(req: express.Request, res: express.Response): void {
    const userId = res.locals.auth.userId;

    SaudacaoService.adeus(userId)
        .then(mensagem => {
            writeJsonResponse(res, 200, mensagem);
        })
        .catch(err => {
            logger.error(`adeus: ${err}`);
            writeJsonResponse(res, 500, {error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}});
        });
}
