import jwt, { Secret, SignCallback, SignOptions } from "jsonwebtoken";

import db from "@AncientOne/utils/db";
import { criarDummy } from "@AncientOne/tests/usuario";
import usuario from "../usuario";

beforeAll(async () => {
    await db.abrir();
});

afterAll(async () => {
    await db.fechar();
});

describe("login", () => {
    it("Deve retornar erro_interno_do_servidor se o jwt.sign falhar com erro", async () => {
        (jwt.sign as any) = (payload: string | Buffer | object,
            secretOrPrivateKey: Secret,
            options: SignOptions,
            callback: SignCallback) => {
                callback(new Error("falha"), undefined);
        }

        const dummy = await criarDummy();
        await expect(usuario.login(dummy.username, dummy.senha)).rejects.toEqual({
            error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}
        });
    });
});
