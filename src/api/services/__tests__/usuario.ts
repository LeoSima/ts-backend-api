import usuario from "../usuario";

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
