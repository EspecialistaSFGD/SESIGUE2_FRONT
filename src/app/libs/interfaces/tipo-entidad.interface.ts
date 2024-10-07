import { PaginationResponse } from "./pagination.interface";

export interface TipoEntidadResponses {
    success: string,
    message: string,
    errors?: string,
    data: TipoEntidadResponse[],
    info?: PaginationResponse,
}

export interface TipoEntidadResponse {
    tipoId?: string,
    nombre: string,
    abreviatura: string
}