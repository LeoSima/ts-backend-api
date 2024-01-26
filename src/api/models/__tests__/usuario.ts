import { faker } from "@faker-js/faker";

import Usuario from "@AncientOne/api/models/usuario";
import db from "@AncientOne/utils/db";
import usuario from "@AncientOne/api/services/usuario";

beforeAll(async () => {
    await db.abrir();
});

afterAll(async () => {
    await db.fechar();
});

describe("salvar", () => {
    it("Deve criar um usuário", async () => {
        const email = faker.internet.email();
        const username = faker.internet.userName();
        const nome = faker.person.fullName();
        const senha = faker.internet.password();
        const momentoAnterior = Date.now();

        const usuario = new Usuario({
            email: email,
            username: username,
            nome: nome,
            senha: senha
        });
        await usuario.save();

        const momentoPosterior = Date.now();
        const retorno = await Usuario.findById(usuario._id);

        expect(retorno).not.toBeNull();
        expect(retorno!.email).toBe(email);
        expect(retorno!.username).toBe(username);
        expect(retorno!.nome).toBe(nome);
        expect(retorno!.senha).not.toBe(senha);
        expect(momentoAnterior).toBeLessThanOrEqual(retorno!.dataCriacao.getTime());
        expect(momentoPosterior).toBeGreaterThanOrEqual(retorno!.dataCriacao.getTime());
    });

    it("Deve atualizar um usuário", async () => {
        const nome1 = faker.person.fullName();
        const usuario = new Usuario({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            nome: nome1,
            senha: faker.internet.password()
        });
        const dbUsuario1 = await usuario.save();

        const nome2 = faker.person.fullName();
        dbUsuario1.nome = nome2;
        const dbUsuario2 = await dbUsuario1.save();
        expect(dbUsuario2.nome).toEqual(nome2);
    });

    it("Não deve salvar usuário com email em formato inválido", async () => {
        const email = "email.invalido@em.o";
        const usuario = new Usuario({
            email: email,
            username: faker.internet.userName(),
            nome: faker.person.fullName(),
            senha: faker.internet.password()
        });
        
        await expect(usuario.save()).rejects.toThrow(/não está no formato de email/);
    });

    it("Não deve salvar usuário sem email", async () => {
        const username = faker.internet.userName();
        const nome = faker.person.fullName();
        const senha = faker.internet.password();
        const usuario = new Usuario({username: username, nome: nome, senha: senha});

        await expect(usuario.save()).rejects.toThrow(/email/);
    });

    it("Não deve salvar um usuário sem username", async () => {
        const email = faker.internet.email();
        const nome = faker.person.fullName();
        const senha = faker.internet.password();
        const usuario = new Usuario({email: email, nome: nome, senha: senha});

        await expect(usuario.save()).rejects.toThrow(/username/);
    });

    it("Não deve salvar um usuário sem nome", async () => {
        const email = faker.internet.email();
        const username = faker.internet.userName();
        const senha = faker.internet.password();
        const usuario = new Usuario({email: email, username: username, senha: senha});

        await expect(usuario.save()).rejects.toThrow(/nome/);
    });

    it("Não deve salvar um usuário sem senha", async () => {
        const email = faker.internet.email();
        const username = faker.internet.userName();
        const nome = faker.person.fullName();
        const usuario = new Usuario({email: email, username: username, nome: nome});

        await expect(usuario.save()).rejects.toThrow(/senha/);
    });

    it("Não deve salvar dois usuários com mesmo email", async () => {
        const email = faker.internet.email();
        const usuario1 = new Usuario({
            email: email,
            username: faker.internet.userName(),
            nome: faker.person.fullName(),
            senha: faker.internet.password()
        });
        const usuario2 = new Usuario({
            email: email,
            username: faker.internet.userName(),
            nome: faker.person.fullName(),
            senha: faker.internet.password()
        });

        await usuario1.save();
        await expect(usuario2.save()).rejects.toThrow(/E11000.*email:/);
    });

    it("Não deve salvar dois usuários com mesmo username", async () => {
        const username = faker.internet.userName();
        const usuario1 = new Usuario({
            email: faker.internet.email(),
            username: username,
            nome: faker.person.fullName(),
            senha: faker.internet.password()
        });
        const usuario2 = new Usuario({
            email: faker.internet.email(),
            username: username,
            nome: faker.person.fullName(),
            senha: faker.internet.password()
        });

        await usuario1.save();
        await expect(usuario2.save()).rejects.toThrow(/E11000.*username:/);
    });

    it("Deve criptografar a senha e não salvá-la de forma 'legível'", async () => {
        const senha = faker.internet.password();

        const usuario1 = new Usuario({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            nome: faker.person.fullName(),
            senha: senha
        });
        await usuario1.save();
        expect(usuario1.senha).not.toBe(senha);

        const usuario2 = new Usuario({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            nome: faker.person.fullName(),
            senha: senha
        });
        await usuario2.save();
        expect(usuario2.senha).not.toBe(senha);

        expect(usuario1.senha).not.toBe(usuario2.senha);
    });
});

describe("validaSenha", () => {
    it("Deve retornar true para senha correta", async () => {
        const senha = faker.internet.password();
        const usuario = new Usuario({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            nome: faker.person.fullName(),
            senha: senha
        });
        await usuario.save();

        expect(await usuario.validaSenha(senha)).toBe(true);
    });

    it("Deve retornar false para senha incorreta", async () => {
        const usuario = new Usuario({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            nome: faker.person.fullName(),
            senha: faker.internet.password()
        });
        await usuario.save();

        expect(await usuario.validaSenha(faker.internet.password())).toBe(false);
    });

    it("Deve atualizar o hash da senha se a senha for alterada", async () => {
        const senha1 = faker.internet.password();
        const senha2 = faker.internet.password();

        const usuario1 = new Usuario({
            email: faker.internet.email(),
            username: faker.internet.userName(),
            nome: faker.person.fullName(),
            senha: senha1
        });
        const dbUsuario1 = await usuario1.save();
        expect(await dbUsuario1.validaSenha(senha1)).toBe(true);

        dbUsuario1.senha = senha2;
        const dbUsuario2 = await dbUsuario1.save();

        expect(await dbUsuario2.validaSenha(senha2)).toBe(true);
        expect(await dbUsuario2.validaSenha(senha1)).toBe(false);
    });
});

describe("toJSON", () => {
    it("Deve retornar um JSON válido", async () => {
        const email = faker.internet.email();
        const username = faker.internet.userName();
        const nome = faker.person.fullName();
        const senha = faker.internet.password();
        const usuario = new Usuario({email: email, username: username, nome: nome, senha: senha});
        await usuario.save();

        expect(usuario.toJSON()).toEqual({
            email: email,
            username: username,
            nome: nome,
            dataCriacao: expect.any(Number)
        });
    });
});
