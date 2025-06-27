import { DataResponses } from "./helpers.interface";

export interface LoginInterface extends DataResponses  {
    codigoUsuario?: string,
    codigoPerfil: string,
    tipo: string,
    descripcionTipo: string,
    sector: string,
    descripcionSector: string,
    codigoDepartamento?: string,
    departamento?: string,
    codigoProvincia?: string,
    provincia?: string,
    codigoDistrito: null,
    distrito?: string,
    entidad?: string,
    descripcionEntidad?: string,
    ubigeoEntidad?: string,
    nombreUsuario?: string,
    correoNotificacion?: string,
    nombreTrabajador?: string,
    tipoDocumento?: string,
    numeroDocumento?: string,
    esActivo: boolean,
    codigoNivel?: number,
    descripcionNivel?: string,
    codigoSubTipo?: string,
    descripcionSubTipo?: string,
    token: LoginTokenResponse,
    refreshToken: LoginRefreshTokeResponse,
    menus: LoginMenuResponse[],
}

export interface LoginTokenResponse {
    codigo: string;
    expiracionToken: string;
}

export interface LoginRefreshTokeResponse {
    codigo: string;
    expiracionToken: string;
}

export interface LoginMenuResponse {
    codigoMenu?: string,
    descripcionItem?: string,
    direccionUrl?: string,
    paramsUrl?: string,
    parentMenu?: string,
    iconoMenu?: string,
    ordenMenu: number,
    esExterno: false,
    visible: true,
    botones: LoginBotonesResponse[]
}

export interface LoginBotonesResponse {
    codigoBoton?: string,
    descripcionBoton?: string,
    iconoBoton?: string,
    ordenBoton: number,
    fechaRegistro?: string,
    codigoUsuario?: string,
    codigoModifica?: string,
    fechaModifica?: string,
    esActivo: true,
}