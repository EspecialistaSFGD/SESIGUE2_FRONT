import { DataResponses } from "./helpers.interface";

export interface EventoSectoresResponses extends DataResponses {
    data: EventoSectorResponse[],
}

export interface EventoSectorResponses extends DataResponses {
    data: EventoSectorResponse,
}

export interface EventoSectorResponse {
    eventoSectorId?: string,
    cantidadRegistros: string,
    eventoId: string,
    evento: string,
    sectorId: string,
    sector: string,
}