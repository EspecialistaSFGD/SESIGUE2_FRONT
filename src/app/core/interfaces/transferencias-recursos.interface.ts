import { DataResponses } from "./helpers.interface";

export interface TransferenciasRecursosResponses extends DataResponses {
  data: TransferenciaRecursoResponse[]
}

export interface TransferenciaRecursoResponses extends DataResponses {
  data: TransferenciaRecursoResponse
}

export interface TransferenciaRecursoResponse {
  transferenciaRecursoIndiceCabeceraId?: string,
  recursoId?: string,
  recurso: string,
  abreviatura: string,
  periodo: number,
  fechaPublicacion: string,
  archivoOriginal: string,
  vigencia: boolean,
  uit: number,
  monto: number
}

export interface TransferenciaRecursoIndiceFormData {
  indice: boolean
}

export interface TransferenciaRecursoData{
  usuarioId: string,
  recursoId: string,
  fecha: string,
  archivo: string
}