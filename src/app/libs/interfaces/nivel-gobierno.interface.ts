import { PaginationResponse } from "./pagination.interface";

export interface NivelGobiernosResponses {
    success: string,
    message: string,
    errors?: string,
    data: NivelGobiernoResponse[],
    info?: PaginationResponse,
}

export interface NivelGobiernoResponse {
    nivelId?: string,
    nombre: string
}