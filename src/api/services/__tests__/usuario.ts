import { faker } from "@faker-js/faker";

import db from "@AncientOne/utils/db";
import usuario from "../usuario";

beforeAll(async () => {
    await db.abrir();
});

afterAll(async () => {
    await db.fechar();
});

describe("auth", () => {
    it("Deve ter um retorno válido com userId para token hardcoded", () => {
        const retorno = usuario.auth("fakeToken");
        expect(retorno).toEqual({userId: "fakeUser"});
    });

    it("Deve retornar erro para token inválido", () => {
        const retorno = usuario.auth("tokenInvalido");
        expect(retorno).toEqual({error: {type: "nao_autorizado", message: "Falha na Autenticação"}});
    });
});

describe("criarUsuario", () => {
    it("Deve retornar true com userId válido", async () => {
        const email = faker.internet.email();
        const username = faker.internet.userName();
        const nome = faker.person.fullName();
        const senha = faker.internet.password();

        await expect(usuario.criarUsuario(email, username, nome, senha)).resolves.toEqual({
            userId: expect.stringMatching(/^[a-f0-9]{24}$/)
        });
    });

    it("Deve resolver com false & erro tratado para email já registrado", async () => {
        const email = faker.internet.email();
        const username = faker.internet.userName();
        const nome = faker.person.fullName();
        const senha = faker.internet.password();
        await usuario.criarUsuario(email, username, nome, senha);

        await expect(usuario.criarUsuario(email, faker.internet.userName(), faker.person.fullName(), faker.internet.password()))
            .resolves.toEqual({
                error: {
                    type: "conta_ja_existente",
                    message: `${email} já cadastrado`
                }
            });
    });

    it("Deve resolver com false & erro tratado para username já registrado", async () => {
        const email = faker.internet.email();
        const username = faker.internet.userName();
        const nome = faker.person.fullName();
        const senha = faker.internet.password();
        await usuario.criarUsuario(email, username, nome, senha);

        await expect(usuario.criarUsuario(faker.internet.email(), username, faker.person.fullName(), faker.internet.password()))
            .resolves.toEqual({
                error: {
                    type: "conta_ja_existente",
                    message: `${username} já cadastrado`
                }
            });
    });

    it("Deve rejeitar com input inválido", async () => {
        const email = "email.invalido@em.c";
        const username = faker.internet.userName();
        const nome = faker.person.fullName();
        const senha = faker.internet.password();

        await expect(usuario.criarUsuario(email, username, nome, senha)).rejects.toThrow("validation failed");
    });
});
