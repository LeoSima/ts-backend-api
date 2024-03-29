import { faker } from "@faker-js/faker";

import request from "supertest";
import { Express } from "express-serve-static-core";

import db from "@AncientOne/utils/db";
import cacheExterno from "@AncientOne/utils/cache_externo";
import { criarServidor } from "@AncientOne/utils/servidor";
import { criarDummy, criarDummyEAutorizar } from "@AncientOne/tests/usuario";
import Usuario from "@AncientOne/api/models/usuario";
import UsuarioService from "@AncientOne/api/services/usuario";

let servidor: Express;
beforeAll(async () => {
    await cacheExterno.abrir();
    await db.abrir();
    servidor = await criarServidor();
});

afterAll(async () => {
    await cacheExterno.fechar();
    await db.fechar();
});

describe("POST /api/v1/usuario", () => {
    it("Deve retornar 201 & response válido para usuário válido", done => {
        request(servidor)
            .post(`/api/v1/usuario`)
            .send({
                email: faker.internet.email(),
                username: faker.internet.userName(),
                nome: faker.person.fullName(),
                senha: faker.internet.password()
            })
            .expect(201)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.body).toMatchObject({
                    userId: expect.stringMatching(/^[a-f0-9]{24}$/)
                });
                done();
            });
    });

    it("Deve retornar 409 & response válido para email duplicado", done => {
        const data = {
            email: faker.internet.email(),
            username: faker.internet.userName(),
            nome: faker.person.fullName(),
            senha: faker.internet.password()
        };

        request(servidor)
            .post(`/api/v1/usuario`)
            .send(data)
            .expect(201)
            .end(function(err, res) {
                if (err) return done(err);
                data.username = faker.internet.userName();
                
                request(servidor)
                    .post(`/api/v1/usuario`)
                    .send(data)
                    .expect(409)
                    .end(function(err, res) {
                        if (err) return done(err);
                        expect(res.body).toMatchObject({
                            error: {
                                type: "conta_ja_existente",
                                message: expect.stringMatching(/já cadastrado/)
                            }
                        });
                        done();
                    });
            });
    });

    it("Deve retornar 409 & response válido para username duplicado", done => {
        const data = {
            email: faker.internet.email(),
            username: faker.internet.userName(),
            nome: faker.person.fullName(),
            senha: faker.internet.password()
        };

        request(servidor)
            .post(`/api/v1/usuario`)
            .send(data)
            .expect(201)
            .end(function(err, res) {
                if (err) return done(err);
                data.email = faker.internet.email();

                request(servidor)
                    .post(`/api/v1/usuario`)
                    .send(data)
                    .expect(409)
                    .end(function(err, res) {
                        if (err) return done(err);
                        expect(res.body).toMatchObject({
                            error: {
                                type: "conta_ja_existente",
                                message: expect.stringMatching(/já cadastrado/)
                            }
                        });
                        done();
                    });
            });
    });

    it("Deve retornar 400 & response válido para requisição inválida", done => {
        request(servidor)
            .post(`/api/v1/usuario`)
            .send({
                email: faker.internet.email(),
                uname: faker.internet.userName(),
                nome: faker.person.fullName(),
                senha: faker.internet.password()
            })
            .expect(400)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.body).toMatchObject({
                    error: {
                        type: "validacao_request",
                        message: expect.stringMatching(/username/)
                    }
                });
                done();
            });
    });
});

describe("POST /api/v1/login", () => {
    it("Deve retornar 200 & response válido para request de login válido com username", done => {
        criarDummy()
            .then(dummy => {
                request(servidor)
                    .post(`/api/v1/login`)
                    .send({
                        login: dummy.username,
                        senha: dummy.senha
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);

                        expect(res.header["x-expires-after"]).toMatch(/^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/);
                        expect(res.body).toEqual({
                            userId: expect.stringMatching(/^[a-f0-9]{24}$/),
                            token: expect.stringMatching(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
                        });

                        done();
                    });
            });
    });

    it("Deve retornar 200 & response válido para request de login válido com email", done => {
        criarDummy()
            .then(dummy => {
                request(servidor)
                    .post(`/api/v1/login`)
                    .send({
                        login: dummy.email,
                        senha: dummy.senha
                    })
                    .expect(200)
                    .end(function(err, res) {
                        if (err) return done(err);

                        expect(res.header["x-expires-after"]).toMatch(/^(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))$/);
                        expect(res.body).toEqual({
                            userId: expect.stringMatching(/^[a-f0-9]{24}$/),
                            token: expect.stringMatching(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
                        });

                        done();
                    });
            });
    });

    it("Deve retornar 404 & response válido para usuário não existente", done => {
        request(servidor)
            .post(`/api/v1/login`)
            .send({
                login: faker.internet.userName(),
                senha: faker.internet.password()
            })
            .expect(404)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.body).toEqual({
                    error: {type: "credenciais_invalidas", message: "Login/Senha Inválido"}
                });
                done();
            });
    });

    it("Deve retornar 404 & response válido para senha incorreta", done => {
        criarDummy()
            .then(dummy => {
                request(servidor)
                .post(`/api/v1/login`)
                .send({
                    login: dummy.username,
                    senha: faker.internet.password()
                })
                .expect(404)
                .end(function(err, res) {
                    if (err) return done(err);
                    expect(res.body).toEqual({
                        error: {type: "credenciais_invalidas", message: "Login/Senha Inválido"}
                    });
                    done();
                });
            });
    });

    it("Deve retornar 400 & response válido para request inválido", done => {
        request(servidor)
            .post(`/api/v1/login`)
            .send({
                usname: faker.internet.userName(),
                senha: faker.internet.password()
            })
            .expect(400)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.body).toMatchObject({
                    error: {
                        type: "validacao_request",
                        message: expect.stringMatching(/login/)
                    }
                });
                done();
            });
    });
});

describe("DELETE /ap/v1/deletarUsuario", () => {
    it("Deve retornar 204 ao deletar usuário com sucesso", done => {
        criarDummyEAutorizar()
            .then(dummy => {
                request(servidor)
                    .delete(`/api/v1/deletarUsuario/${dummy.userId}`)
                    .set("Authorization", `Bearer ${dummy.token}`)
                    .expect(204)
                    .end(function (err, res) {
                        if (err) return done(err);
                        done();
                    });
            });
    });

    it("Deve retornar 401 ao fazer requisição sem o token de acesso", done => {
        criarDummyEAutorizar()
            .then(dummy => {
                request(servidor)
                    .delete(`/api/v1/deletarUsuario/${dummy.userId}`)
                    .expect(401)
                    .end(function (err, res) {
                        if (err) return done(err);
                        done();
                    });
            });
    });

    it("Deve retornar 404 ao tentar deletar usuário não existente", done => {
        const usuarioId = faker.database.mongodbObjectId();

        criarDummyEAutorizar()
            .then(dummy => {
                request(servidor)
                    .delete(`/api/v1/deletarUsuario/${usuarioId}`)
                    .set("Authorization", `Bearer ${dummy.token}`)
                    .expect(404)
                    .end(function(err, res) {
                        if (err) return done(err);
                        expect(res.body).toMatchObject({
                            error: {
                                type: "usuario_nao_encontrado",
                                message: "Usuário não encontrado para o ID informado"
                            }
                        });
                        done();
                    });
            });
    });

    it("Deve retornar 500 caso aconteça um erro no lado do MongoDB", done => {
        Usuario.findByIdAndDelete = jest.fn().mockImplementationOnce(() => {
            throw new Error("Erro Teste");
        });

        criarDummyEAutorizar()
            .then(dummy => {
                request(servidor)
                    .delete(`/api/v1/deletarUsuario/${dummy.userId}`)
                    .set("Authorization", `Bearer ${dummy.token}`)
                    .expect(500)
                    .end(function (err, res) {
                        if (err) return done(err);
                        expect(res.body).toMatchObject({
                            error: {
                                type: "erro_interno_do_servidor",
                                message: "Erro Interno do Servidor"
                            }
                        });
                        done();
                    });
            });
    });

    it("Deve retornar 500 caso aconteça um erro inesperado na service", done => {
        UsuarioService.deletarUsuario = jest.fn().mockRejectedValueOnce(new Error("Erro Teste"));

        criarDummyEAutorizar()
            .then(dummy => {
                request(servidor)
                    .delete(`/api/v1/deletarUsuario/${dummy.userId}`)
                    .set("Authorization", `Bearer ${dummy.token}`)
                    .expect(500)
                    .end(function (err, res) {
                        if (err) return done(err);
                        expect(res.body).toMatchObject({
                            error: {
                                type: "erro_interno_do_servidor",
                                message: "Erro Interno do Servidor"
                            }
                        });
                        done();
                    });
            });
    });
});
