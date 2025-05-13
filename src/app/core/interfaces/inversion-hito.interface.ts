import { DataResponses } from "./helpers.interface"

export interface InversionHitosResponses extends DataResponses {
  data: InversionHitoResponse[]
}

export interface InversionHitoResponse {
    hitoID?: string,
    etapaID: string,
    nombre: string,
}