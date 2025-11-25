import { DataResponses } from "./helpers.interface";

export interface BotonesResponses extends DataResponses {
    data: BotonResponse[],
}

export interface BotonResponses extends DataResponses {
    data: BotonResponse,
}

export interface BotonResponse {
    botonId?: string,
    nombre: string,
    icono: string
    orden?: string
    estado: boolean
}