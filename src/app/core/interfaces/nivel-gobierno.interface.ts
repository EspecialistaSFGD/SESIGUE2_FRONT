import { DataResponses } from "./helpers.interface";

export interface NivelGobiernosResponses extends DataResponses {
    data: NivelGobiernoResponse[],
}

export interface NivelGobiernoResponse {
    nivelId?: string,
    nombre: string
}