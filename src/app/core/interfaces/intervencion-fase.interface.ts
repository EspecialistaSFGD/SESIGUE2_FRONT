import { DataResponses } from "./helpers.interface"

export interface IntervencionFasesResponses extends DataResponses {
  data: IntervencionFaseResponse[]
}

export interface IntervencionFaseResponse {
  intervencionFaseId?: string,
  tipoIntervencion: string,
  nombre: string,
}