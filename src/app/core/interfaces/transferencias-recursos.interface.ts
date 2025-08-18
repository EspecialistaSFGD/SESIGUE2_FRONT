import { DataResponses } from "./helpers.interface";

export interface TransferenciasRecursosResponses extends DataResponses {
  data: TransferenciaRecursoResponse[]
}

export interface TransferenciaRecursoResponse {
  recursoId?: string,
  recurso: string,
  abreviatura: string,
  periodo: number,
  fechaPublicacion: string,
  archivoOriginal: string,
  uit: number,
  monto: number
}

export interface TransferenciaRecursoIndiceFormData {
  indice: boolean
}