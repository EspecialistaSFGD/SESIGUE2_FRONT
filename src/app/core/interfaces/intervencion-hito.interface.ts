import { DataResponses } from "./helpers.interface"

export interface IntervencionHitosResponses extends DataResponses {
  data: IntervencionHitoResponse[]
}

export interface IntervencionHitoResponse {
  intervencionHitoId?: string,
  intervencionEtapaId: string,
  nombre: string,
}