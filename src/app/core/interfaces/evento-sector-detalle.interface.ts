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
    entidadId: string,
    sectorId: string,
    cantidadPedidos: number,
    usuarioId?:number
}

export interface DepartamentoEventoDetalle {
    entidadId?: string,
    nombre: string,
    ubigeo: string,
    seleccionado: boolean
}