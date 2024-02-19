import * as express from "express";

import UsuarioService, { ErroResponse } from "@AncientOne/api/services/usuario";
import { writeJsonResponse } from "@AncientOne/utils/express" ;
import logger from "@AncientOne/utils/logger";

export function auth(req: express.Request, res: express.Response, next: express.NextFunction): void {
    // TODO: Verificar se o método funcionará (está diferente do que foi feito no artigo)
    try {
        const token = req.headers.authorization!;
        const auth = UsuarioService.auth(token);
        UsuarioService.auth(token)
            .then(auth => {
                if (!(auth as any).error) {
                    res.locals.auth = {
                        userId: (auth as {userId: string}).userId
                    }
                    next();
                } else {
                    writeJsonResponse(res, 401, auth);
                }
            });
    } catch(erro) {
        writeJsonResponse(res, 500, {error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}});
    }
}

export function criarUsuario(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const {email, username, nome, senha} = req.body;

    UsuarioService.criarUsuario(email, username, nome, senha)
        .then(resp => {
            if ((resp as any).error) {
                if ((resp as ErroResponse).error.type === "conta_ja_existente")
                    writeJsonResponse(res, 409, resp);
                else
                    throw new Error(`Não suportado ${resp}`);
            } else {
                writeJsonResponse(res, 201, resp);
            }
        })
        .catch((err: any) => {
            logger.error(`criarUsuario: ${err}`);
            writeJsonResponse(res, 500, {error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}});
        });
}

export function login(req: express.Request, res: express.Response): void {
    const {login, senha} = req.body;

    UsuarioService.login(login, senha)
        .then(resp => {
            if((resp as any).error) {
                if((resp as ErroResponse).error.type === "credenciais_invalidas")
                    writeJsonResponse(res, 404, resp);
                else
                    throw new Error(`unsupported ${resp}`);
            } else {
                const {userId, token, expiraEm} = resp as {token: string, userId: string, expiraEm: Date}
                writeJsonResponse(res, 200, {userId: userId, token: token}, {"X-Expires-After": expiraEm.toISOString()});
            }
        })
        .catch((err: any) => {
            logger.error(`login: ${err}`);
            writeJsonResponse(res, 500, {error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}});
        });
}
