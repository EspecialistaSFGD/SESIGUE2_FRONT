import { MenuModel } from "../shared/menu.model";
import { SelectModel } from "../shared/select.model";
import { Token } from "./token.model";

export class UsuarioModel {
    constructor(
        public nombreUsuario?: string,
        public codigoUsuario?: string,
        public clave?: string,
        public correo?: string,
        public nombre?: string,
        public dni?: string,
        public telefono?: string,
        public entidad?: SelectModel,
        public perfil?: SelectModel,
        public tipo?: SelectModel,
        public sector?: SelectModel,
        public dep?: SelectModel,
        public prov?: SelectModel,
        public token?: Token,
        public refreshToken?: Token,
        public menus?: MenuModel[],
    ) { }
}

export interface UsuarioRequestModel {
    codigoPerfil: number;
    tipo: number;
    sector: number;
    codigoDepartamento: string;
    codigoProvincia: string;
    entidad: number;
    codigoUsuario: number;
    nombreUsuario: string;
    contrasena: string;
    telefono: string,
    correoNotificacion: string;
    nombresPersona: string;
    tipoDocumento: number;
    numeroDocumento: string;
    esActivo: boolean;
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

export class AuthLoginModel {
    constructor(
        public usuario: string,
        public clave: string,
        public recordar?: string,
    ) { }
}

export class AuthRequestModel {
    constructor(
        public numeroDocumento?: string,
        public clave?: string,
    ) { }
}
