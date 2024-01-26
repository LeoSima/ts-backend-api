/* istanbul ignore file */
import { faker } from "@faker-js/faker";

import Usuario from "@AncientOne/api/models/usuario";
import UsuarioService from "@AncientOne/api/services/usuario";

type UsuarioDummy = {email: string, username: string, nome: string, senha: string, userId: string};
type UsuarioDummyAutorizado = {email: string, username: string, nome: string, senha: string, userId: string, token: string};

export function dummy() {
    return {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        nome: faker.person.fullName(),
        senha: faker.internet.password()
    };
}

export async function criarDummy(): Promise<UsuarioDummy> {
    const usuario = dummy();
    const dbUsuario = new Usuario(usuario);
    await dbUsuario.save();

    return {...usuario, userId: dbUsuario._id.toString()};
}

export async function criarDummyEAutorizar(): Promise<UsuarioDummyAutorizado> {
    const usuario = await criarDummy();
    const authToken = await UsuarioService.criarTokenDeAutenticacao(usuario.userId);

    return {...usuario, token: authToken.token};
}
