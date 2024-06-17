import { MenuModel } from "../shared/menu.model";
import { Token } from "./token.model";

export class UsuarioModel {
    constructor(
        public nombreUsuario?: string,
        public codigoUsuario?: string,
        public nombreTrabajador?: string,
        public perfil?: string,
        public token?: Token,
        public refreshToken?: Token,
        public menus?: MenuModel[],
    ) { }
}

export class UsuarioRequestModel {
    constructor(
        public nombreUsuario?: string,
        public codigoUsuario?: string,
    ) { }
}
