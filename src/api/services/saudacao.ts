import Usuario from "@AncientOne/api/models/usuario";
import logger from "@AncientOne/utils/logger";

async function adeus(userId: string): Promise<{mensagem: string}> {
    try {
        const usuario = await Usuario.findById(userId);
        if (!usuario)
            throw new Error("Usuário não encontrado");

        return {mensagem: `Adeus, ${usuario.nome}!`};
    } catch(err) {
        logger.error(`adeus: ${err}`);
        return Promise.reject({error: {type: "erro_interno_do_servidor", message: "Erro Interno do Servidor"}});
    }
}

export default {adeus: adeus};
