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

export class UsuarioResponseModel {
    constructor(
        public codigoUsuario?: number,
        public nombreUsuario?: string,
        public contrasena?: string,
        public correoNotificacion?: string,
        public nombresPersona?: string,
        public apellidoMaterno?: string,
        public apellidoPaterno?: string,
        public tipoDocumento?: number,
        public numeroDocumento?: string,
        public codigoPerfil?: number,
        public descripcionPerfil?: string,
        public esActivo?: boolean,
        public descripcionEstado?: string,
    ) { }
}

export class UsuarioRequestModel {
    constructor(
        public nombreUsuario?: string,
        public codigoUsuario?: string,
    ) { }
}
