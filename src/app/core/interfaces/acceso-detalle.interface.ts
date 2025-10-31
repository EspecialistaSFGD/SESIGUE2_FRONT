import { DataResponses } from "./helpers.interface";

export interface AccesoDetallesResponses extends DataResponses {
    data: AccesoDetalleResponse[],
}

export interface AccesoDetalleResponses extends DataResponses {
    data: AccesoDetalleResponse,
}

export interface AccesoDetalleResponse {
    accesoDetalleId?: string,
    accesoId: string,
    botonId: string,
    boton?: string,
    botonIcono?: string
}