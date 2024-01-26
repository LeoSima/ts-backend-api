import Usuario from "@AncientOne/api/models/usuario";
import logger from "@AncientOne/utils/logger";

export type ErroResponse = {error: {type: string, message: string}};
export type AuthResponse = ErroResponse | {userId: string};
export type CreateUserResponse = ErroResponse | {userId: string};

function auth(bearerToken: string) : AuthResponse {
    const token = bearerToken.replace("Bearer ", "");

    if (token === "fakeToken")
        return ({userId: "fakeUser"});

    return ({error: {type: "nao_autorizado", message: "Falha na Autenticação"}});
}

function criarUsuario(email: string, username: string, nome: string, senha: string): Promise<CreateUserResponse> {
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

export default {auth: auth, criarUsuario: criarUsuario};
