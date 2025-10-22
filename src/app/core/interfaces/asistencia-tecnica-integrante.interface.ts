import { DataResponses } from "./helpers.interface";

export interface AsistenciaTecnicaIntegrantesResponses extends DataResponses {
  data: AsistenciaTecnicaIntegranteResponse[],
}

export interface AsistenciaTecnicaIntegranteResponses extends DataResponses {
  data: AsistenciaTecnicaIntegranteResponse,
}

export interface AsistenciaTecnicaIntegranteResponse {
    integranteId?: string,
    asistenciaTecnicaId: string,
    asistenteId: string,
    nivelGobiernoId: string,
    nivelGobierno?: string,
    nivelGobiernoSlug?: string,
    sectorId?: string,
    sector?: string,
    entidadId: string,
    entidad?: string,
    entidadTipo?: string,
    entidadSlug?: string,
    ubigeo?: string,
    dni?: string,
    nombres?: string,
    apellidos?: string,
    cargo?: string,
    telefono?: string,
    correo?: string,
}