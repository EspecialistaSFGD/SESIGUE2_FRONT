import { DataResponses } from "./helpers.interface";

export interface EventoSectorDetallesResponses extends DataResponses {
    data: EventoSectorDetalleResponse[],
}

export interface EventoSectorDetalleResponses extends DataResponses {
    data: EventoSectorDetalleResponse,
}

export interface EventoSectorDetalleResponse {
    eventoSectorDetalleId?: string,
    eventoId: string,
    entidadUbigeoId: string,
    entidadSectorId: string,
    cantidadPedidos: string,
}