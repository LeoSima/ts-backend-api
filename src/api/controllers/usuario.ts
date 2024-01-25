import * as express from "express";

import UsuarioService from "@TildaSwanton/api/services/usuario";
import { writeJsonResponse } from "@TildaSwanton/utils/express" ;

export function auth(req: express.Request, res: express.Response, next: express.NextFunction): void {
    try {
        const token = req.headers.authorization!;
        const auth = UsuarioService.auth(token);

        if (!(auth as any).error) {
            res.locals.auth = {
                userId: (auth as {userId: string}).userId
            }
            next();
        } else {
            writeJsonResponse(res, 401, auth);
        }
    } catch(erro) {
        writeJsonResponse(res, 500, {error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}});
    }
}
