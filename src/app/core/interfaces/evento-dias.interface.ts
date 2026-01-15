import { DataResponses } from "./helpers.interface";

export interface EventoDiasResponses extends DataResponses {
    data: EventoDiaResponse[],
}

export interface EventoDiaResponses extends DataResponses {
    data: EventoDiaResponse,
}

export interface EventoDiaResponse {
    eventoDiaId?: string,
    eventoId: string,
    evento?: string,
    fecha: string,
    plenaria: boolean,
    cantidadSector: number,
    cantidadRegionalLocal: number,
}