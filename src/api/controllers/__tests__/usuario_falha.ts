import { faker } from "@faker-js/faker";
import request from "supertest";
import { Express } from "express-serve-static-core";

import UsuarioService from "@AncientOne/api/services/usuario";
import { criarServidor } from "@AncientOne/utils/servidor";

jest.mock("@AncientOne/api/services/usuario");

let servidor: Express;
beforeAll(async () => {
    servidor = await criarServidor();
});

describe("auth com falha", () => {
    it("Deve retornar 500 & e retornar erro tratado se o método auth lançar algum erro", done => {
        (UsuarioService.auth as jest.Mock).mockImplementation(() => {
            throw new Error();
        });

        request(servidor)
            .get(`/api/v1/adeus`)
            .set("Authorization", "Bearer fakeToken")
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).toMatchObject({error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}});
                done();
            });
    });
});

describe("criarUsuario falha", () => {
    it("Deve retornar 500 & response válido se método auth lançar erro", done => {
        (UsuarioService.criarUsuario as jest.Mock).mockResolvedValue({error: {type: "desconhecido"}});

        request(servidor)
            .post(`/api/v1/usuario`)
            .send({
                email: faker.internet.email(),
                username: faker.internet.userName(),
                nome: faker.person.fullName(),
                senha: faker.internet.password()
            })
            .expect(500)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.body).toMatchObject({error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}});
                done();
            });
    });
});
