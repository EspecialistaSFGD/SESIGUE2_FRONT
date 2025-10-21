import { DataResponses } from "./helpers.interface";

export interface AsistenciaTecnicaCompromisosResponses extends DataResponses {
  data: AsistenciaTecnicaCompromisoResponse[],
}

export interface AsistenciaTecnicaCompromisoResponses extends DataResponses {
  data: AsistenciaTecnicaCompromisoResponse,
}

export interface AsistenciaTecnicaCompromisoResponse {
    compromisoId?: string,
    asistenciaTecnicaId: string,
    nivelGobiernoId: string,
    nivelGobierno?: string,
    nivelGobiernoSlug?: string,
    entidadId: string,
    entidad?: string,
    entidadTipo?: string,
    entidadSlug?: string,
    ubigeo?: string,
    departamento?: string,
    provincia?: string,
    distrito?: string,
    plazo?: string,
    compromiso?: string,
}