export type ErroResponse = {error: {type: string, message: string}};
export type AuthResponse = ErroResponse | {userId: string}

function auth(bearerToken: string) : AuthResponse {
    const token = bearerToken.replace("Bearer ", "");

    if (token === "fakeToken")
        return ({userId: "fakeUser"});

    return ({error: {type: "nao_autorizado", message: "Falha na Autenticação"}});
}

export default {auth: auth};
