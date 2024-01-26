import request from "supertest";
import { Express } from "express-serve-static-core";

import { criarServidor } from "@AncientOne/utils/servidor";

let servidor: Express;

beforeAll(async() => {
    servidor = await criarServidor();
});

describe("GET /ola", () => {
    it("Deve retornar 200 & retorno válido se a lista de parâmetros da request estiver vazia", done => {
        request(servidor)
            .get(`/api/v1/ola`)
            .expect("Content-Type", /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).toMatchObject({"mensagem": "Olá, estranho!"});
                return done();
            });
    });

    it("Deve retornar 200 & retorno válido se o parâmetro nome estiver setado", done => {
        request(servidor)
            .get(`/api/v1/ola?nome=Nome%20Teste`)
            .expect("Content-Type", /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).toMatchObject({"mensagem": "Olá, Nome Teste!"});
                return done();
            });
    });

    it("Deve retornar 400 & erro tratado se o parâmetro novo estiver vazio", done => {
        request(servidor)
            .get(`/api/v1/ola?nome=`)
            .expect("Content-Type", /json/)
            .expect(400)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).toMatchObject({error: {
                    type: "validacao_request",
                    message: expect.stringMatching(/Empty.*\'nome'/),
                    errors: expect.anything()
                }});
                done();
            });
    });
});

describe("GET /adeus", () => {
    it("Deve retornar 200 & retorno válido para autorização com token falso hardcoded", done => {
        request(servidor)
            .get(`/api/v1/adeus`)
            .set("Authorization", "Bearer fakeToken")
            .expect("Content-Type", /json/)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).toMatchObject({"mensagem": "Adeus, fakeUser!"});
                done();
            });
    });

    it("Deve retornar 401 & erro tratado para token de autorização inválido", done => {
        request(servidor)
            .get(`/api/v1/adeus`)
            .set("Authorization", "Bearer tokenInvalido")
            .expect("Content-Type", /json/)
            .expect(401)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).toMatchObject({error: {type: "nao_autorizado", message: "Falha na Autenticação"}});
                done();
            });
    });

    it("Deve retornar 401 & erro tratado para requisição sem authorization header", done => {
        request(servidor)
            .get(`/api/v1/adeus`)
            .expect("Content-Type", /json/)
            .expect(401)
            .end((err, res) => {
                if (err) return done(res);
                expect(res.body).toMatchObject({error: {
                    type: "validacao_request",
                    message: "Authorization header required",
                    errors: expect.anything()
                }});
                done();
            });
    });
});
