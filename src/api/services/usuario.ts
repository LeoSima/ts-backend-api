import fs from "fs";
import jwt, { SignOptions, VerifyErrors, VerifyOptions } from "jsonwebtoken";

import Usuario, { IUsuario } from "@AncientOne/api/models/usuario";
import config from "@AncientOne/config";
import cacheLocal from "@AncientOne/utils/cache_local";
import logger from "@AncientOne/utils/logger";

export type ErroResponse = {error: {type: string, message: string}};
export type AuthResponse = ErroResponse | {userId: string};
export type CriarUsuarioResponse = ErroResponse | {userId: string};
export type LoginUsuarioResponse = ErroResponse | {token: string, userId: string, expiraEm: Date};

const privateKey = fs.readFileSync(config.privateKeyFile);
const privateSecret = {
    key: privateKey,
    passphrase: config.privateKeyPassphrase
};
const signOptions: SignOptions = {
    algorithm: "RS256",
    expiresIn: "14d"
};

const publicKey = fs.readFileSync(config.publicKeyFile);
const verifyOptions: VerifyOptions = {
    algorithms: ["RS256"]
};

function auth(bearerToken: string) : Promise<AuthResponse> {
    return new Promise(function(resolve, reject) {
        const token = bearerToken.replace("Bearer ", "");
    
        jwt.verify(token, publicKey, verifyOptions, (err: VerifyErrors | null, decoded: object | undefined | any) => {
            if (err === null && decoded !== undefined) {
                const d = decoded as {userId?: string, exp: number};

                if (d.userId) {
                    resolve({userId: d.userId});
                    return;
                }
            }

            resolve({error: {type: "nao_autorizado", message: "Falha na Autenticação"}});
        });
    });
}

function criarTokenDeAutenticacao(userId: string): Promise<{token: string, expiraEm: Date}> {
    return new Promise(function (resolve, reject) {
        return jwt.sign({userId: userId}, privateSecret, signOptions, (err: Error | null, encoded: string | undefined) => {
            if (err === null && encoded !== undefined) {
                const expiraApos = 2 * 604800 /* duas semanas */
                const expiraEm = new Date();
                expiraEm.setSeconds(expiraEm.getSeconds() + expiraApos);

                resolve({token: encoded, expiraEm: expiraEm})
            } else {
                reject(err);
            }
        });
    });
}

async function login(login: string, senha: string): Promise<LoginUsuarioResponse> {
    try {
        let usuario: IUsuario | undefined | null = cacheLocal.get<IUsuario>(login);

        if (!usuario) {
            usuario = await Usuario.findOne({username: login});
            
            if (!usuario)
                return {error: {type: "credenciais_invalidas", message: "Login/Senha Inválido"}};

            cacheLocal.set(usuario._id.toString(), usuario);
            cacheLocal.set(login, usuario);
        }

        const senhaCorresponde = await usuario.validaSenha(senha);
        if (!senhaCorresponde)
            return {error: {type: "credenciais_invalidas", message: "Login/Senha Inválido"}};

        const authToken = await criarTokenDeAutenticacao(usuario._id.toString());
        return {userId: usuario._id.toString(), token: authToken.token, expiraEm: authToken.expiraEm};
    } catch (err) {
        logger.error(`login: ${err}`);
        return Promise.reject({error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}});
    }
}

function criarUsuario(email: string, username: string, nome: string, senha: string): Promise<CriarUsuarioResponse> {
    return new Promise(function(resolve, reject) {
        const usuario = new Usuario({email: email, username: username, nome: nome, senha: senha});

        usuario.save()
            .then(usuarioCriado => {
                resolve({userId: usuarioCriado._id.toString()});
            })
            .catch(err => {
                if (err.code === 11000 && new RegExp(/E11000.*email:/).test(err.message)) {
                    resolve({error: {type: "conta_ja_existente", message: `${email} já cadastrado`}});
                } else if (err.code === 11000 && new RegExp(/E11000.*username:/).test(err.message)) {
                    resolve({error: {type: "conta_ja_existente", message: `${username} já cadastrado`}});
                } else {
                    logger.error(`criarUsuario: ${err}`);
                    reject(err);
                }
            });
    });
}

export default {auth: auth, criarTokenDeAutenticacao: criarTokenDeAutenticacao, login: login, criarUsuario: criarUsuario};
