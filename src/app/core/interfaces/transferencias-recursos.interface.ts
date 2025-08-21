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
  archivoIndice: string,
  archivoProyeccion: string,
  vigencia: boolean,
  uit: number,
  monto: number
}

export interface TransferenciaRecursoIndiceFormData {
  indice: boolean,
  success: boolean,
  recursosIndices: TransferenciaRecursoIndiceData[]
}

export interface TransferenciaRecursoData{
  usuarioId: string,
  recursoId: string,
  monto: string,
  fecha: string,
  archivo: string
}

export interface TransferenciaRecursoIndiceDataResponses extends DataResponses {
  data: TransferenciaRecursoIndiceData[]
}

export interface TransferenciaRecursoIndiceData {
  row: string,
  tipo: string,
  departamento: string,
  provincia: string,
  distrito: string,
  indice: string,
  indiceDistrito: string,
  total: string,
  estado: boolean
}