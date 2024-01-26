import { faker } from "@faker-js/faker";

import request from "supertest";
import { Express } from "express-serve-static-core";

import db from "@AncientOne/utils/db";
import { criarServidor } from "@AncientOne/utils/servidor";

let servidor: Express;
beforeAll(async () => {
    await db.abrir();
    servidor = await criarServidor();
});

afterAll(async () => {
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

    it("Deve retonar 409 & response válido para email duplicado", done => {
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
