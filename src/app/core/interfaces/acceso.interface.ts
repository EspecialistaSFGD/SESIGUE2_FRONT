import { DataResponses } from "./helpers.interface";

export interface AccesosResponses extends DataResponses {
    data: AccesoResponse[],
}

export interface AccesoResponses extends DataResponses {
    data: AccesoResponse,
}

export interface AccesoResponse {
    accesoId?: string,
    perfilId: string,
    perfil?: string,
    perfilDescripcion?: string,
    menuId: string,
    menuPadreId?: string,
    menu?: string,
    menuUrl?: string,
    menuIcono?: string,
    menuExterno?: string,
    menuParametros?: string,
    menuVisible?: string,
}