import request from "supertest";
import { Express } from "express-serve-static-core";

import UsuarioService from "@TildaSwanton/api/services/usuario";
import { criarServidor } from "@TildaSwanton/utils/servidor";

jest.mock("@TildaSwanton/api/services/usuario");

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
