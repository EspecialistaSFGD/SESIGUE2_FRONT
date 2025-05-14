import { DataResponses } from "./helpers.interface"

export interface InversionHitosResponses extends DataResponses {
  data: InversionHitoResponse[]
}

export interface InversionHitoResponse {
  inversionHitoId?: string,
  inversionEtapaId: string,
  nombre: string,
}