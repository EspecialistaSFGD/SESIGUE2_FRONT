import { DataResponses } from "./helpers.interface";

export interface EspaciosResponses extends DataResponses {
    data: EspacioResponse[],
}

export interface EspacioResponse {
    espacioId?: string,
    nombre: string
}