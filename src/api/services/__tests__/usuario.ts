import { faker } from "@faker-js/faker";

import db from "@AncientOne/utils/db";
import cacheExterno from "@AncientOne/utils/cache_externo";
import usuario from "../usuario";
import { criarDummy, criarDummyEAutorizar } from "@AncientOne/tests/usuario";

beforeAll(async () => {
    await cacheExterno.abrir();
    await db.abrir();
});

afterAll(async () => {
    await cacheExterno.fechar();
    await db.fechar();
});

describe("auth", () => {
    it("Deve ter um retorno válido para token válido", async () => {
        const dummy = await criarDummyEAutorizar();
        await expect(usuario.auth(dummy.token)).resolves.toEqual({userId: dummy.userId});
    });

    it("Deve ter retorno válido token válido que não esteja salvo em cache", async () => {
        cacheExterno.getPropriedade = jest.fn().mockReturnValueOnce(null);

        const dummy = await criarDummyEAutorizar();
        await expect(usuario.auth(dummy.token)).resolves.toEqual({userId: dummy.userId});
    });

    it("Deve ter retorno válido para token válido com problema na conexão do Redis para recuperar propriedade", async () => {
        cacheExterno.getPropriedade = jest.fn().mockRejectedValue(new Error("Erro teste"));

        const dummy = await criarDummyEAutorizar();
        await expect(usuario.auth(dummy.token)).resolves.toEqual({userId: dummy.userId});
    });

    it("Deve ter retorno válido para token válido com problema na conexão do Redis para recuperar e setar propriedade", async () => {
        cacheExterno.getPropriedade = jest.fn().mockRejectedValue(new Error("Erro teste"));
        cacheExterno.setPropriedade = jest.fn().mockRejectedValue(new Error("Erro teste"));

        const dummy = await criarDummyEAutorizar();
        await expect(usuario.auth(dummy.token)).resolves.toEqual({userId: dummy.userId});
    });

    it("Deve retornar erro para token inválido", async () => {
        const response = await usuario.auth("tokenInvalido");
        expect(response).toEqual({error: {type: "nao_autorizado", message: "Falha na Autenticação"}});
    });
});

describe("login", () => {
    it("Deve retornar JWT token, userId e tempo até expirar para login e senha válidos", async () => {
        const dummy = await criarDummy();
        await expect(usuario.login(dummy.username, dummy.senha)).resolves.toEqual({
            userId: dummy.userId,
            token: expect.stringMatching(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/),
            expiraEm: expect.any(Date)
        });
    });

    it("Deve retornar com erro se não existir usuário para o login informado", async () => {
        await expect(usuario.login(faker.internet.userName(), faker.internet.password())).resolves.toEqual({
            error: {type: "credenciais_invalidas", message: "Login/Senha Inválido"}
        });
    });

    it("Deve retornar com erro para senha esteja errada", async () => {
        const dummy = await criarDummy();
        await expect(usuario.login(dummy.username, faker.internet.password())).resolves.toEqual({
            error: {type: "credenciais_invalidas", message: "Login/Senha Inválido"}
        });
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
