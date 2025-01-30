import { DataResponses } from "./helpers.interface";

export interface TipoEntidadesResponses extends DataResponses {
    data: TipoEntidadResponse[],
}

export interface TipoEntidadResponse {
    tipoId?: string,
    nombre: string,
    abreviatura: string,
    estado: boolean
}