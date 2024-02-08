import Usuario, { IUsuario } from "@AncientOne/api/models/usuario";
import cacheLocal from "@AncientOne/utils/cache_local";
import logger from "@AncientOne/utils/logger";

async function adeus(userId: string): Promise<{mensagem: string}> {
    try {
        let usuario: IUsuario | undefined | null = cacheLocal.get<IUsuario>(userId);

        if (!usuario) {
            usuario = await Usuario.findById(userId);

            if (!usuario)
                throw new Error("Usuário não encontrado");

            cacheLocal.set(userId, usuario);
        }

        return {mensagem: `Adeus, ${usuario.nome}!`};
    } catch(err) {
        logger.error(`adeus: ${err}`);
        return Promise.reject({error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}});
    }
}

export default {adeus: adeus};
