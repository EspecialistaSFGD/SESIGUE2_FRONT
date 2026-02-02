import { AsistenteResponse } from "./asistente.interface";
import { DataResponses } from "./helpers.interface";

export interface AutoridadesResponses extends DataResponses {
    data: AutoridadResponse[],
}

export interface AutoridadResponses extends DataResponses {
    data: AutoridadResponse,
}

export interface AutoridadResponse extends AsistenteResponse {
    autoridadId?: string,
    entidadId: string,
    asistenteId: string,
    cargo: string,
    foto: string,
    partidoPolitico: string,
    vigente: boolean,
    fechaJne?: string,
    fechaInicia?: string,
    fechaCese?: string,
}