import { DataResponses } from "./helpers.interface"

export interface InversionFasesResponses extends DataResponses {
  data: InversionFaseResponse[]
}

export interface InversionFaseResponse {
  inversionFaseId?: string,
  tipoInversion: string,
  nombre: string,
}