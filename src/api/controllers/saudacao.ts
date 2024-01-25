import * as express from "express";
import { writeJsonResponse } from "@TildaSwanton/utils/express";

export function ola(req: express.Request, res: express.Response): void {
    const nome = req.query.nome || "estranho";
    writeJsonResponse(res, 200, {"mensagem": `Olá, ${nome}!`});
}

export function adeus(req: express.Request, res: express.Response): void {
    const userId = res.locals.auth.userId;
    writeJsonResponse(res, 200, {"mensagem": `Adeus, ${userId}!`});
}
