import { PaginationResponse } from "./pagination.interface";

export interface EspaciosResponses {
    success: string,
    message: string,
    errors?: string,
    data: EspacioResponse[],
    info?: PaginationResponse,
}

export interface EspacioResponse {
    espacioId?: string,
    nombre: string
}