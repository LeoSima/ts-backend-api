import bcrypt from "bcrypt";
import { Schema, Document, model, Model } from "mongoose";

import validator from "validator";

interface IUsuarioDocument extends Document {
    email: string
    username: string
    nome: string
    senha: string
    dataCriacao: Date
}

export interface IUsuario extends IUsuarioDocument {
    // operações a nível de documento
    validaSenha(senha: string): Promise<boolean>
}

const usuarioSchema = new Schema<IUsuario>({
    email: {type: String, required: true, trim: true, validate: [validator.isEmail, "não está no formato de email"]},
    username: {type: String, required: true},
    nome: {type: String, required: true},
    senha: {type: String, required: true},
    dataCriacao: {type: Date, default: Date.now},
}, {strict: true});
usuarioSchema.index({username: 1}, {unique: true, collation: {locale: "en_US", strength: 1}, sparse: true});
usuarioSchema.index({email: 1}, {unique: true, collation: {locale: "en_US", strength: 1}, sparse: true});

usuarioSchema.pre<IUsuarioDocument>("save", function (next): void {
    if (this.isModified("senha")) {
        bcrypt.genSalt(10, (err, salt) => {
            /* istanbul ignore next */
            if (err) return next(err);
            
            bcrypt.hash(this.senha, salt, (err, hash) => {
                /* istanbul ignore next */
                if (err) return next(err);

                this.senha = hash;
                next();
            });
        });
    } else {
        next();
    }
});

usuarioSchema.set("toJSON", {
    transform: function (doc, ret, opcoes) {
        ret.dataCriacao = ret.dataCriacao.getTime();

        delete ret.__v;
        delete ret._id;
        delete ret.senha;
    }
});

usuarioSchema.methods.validaSenha = function(senhaInserida: string): Promise<boolean> {
    const {senha} = this;

    return new Promise(function(resolve, reject) {
        bcrypt.compare(senhaInserida, senha, function(err, ehCorrespondente) {
            /* istanbul ignore next */
            if (err) reject(err);
            return resolve(ehCorrespondente);
        });
    });
}

export interface IUsuarioModel extends Model<IUsuario> {
    // operações a nível de collection/documents (fetch um ou vários, update...)
}

export const Usuario : IUsuarioModel = model<IUsuario, IUsuarioModel>("Usuario", usuarioSchema);

export default Usuario;
