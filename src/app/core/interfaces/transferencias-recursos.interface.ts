import { DataResponses } from "./helpers.interface";

export interface TransferenciasRecursosResponses extends DataResponses {
  data: TransferenciaRecursoResponse[]
}

export interface TransferenciaRecursoResponse {
  transferenciaId?: string,
}