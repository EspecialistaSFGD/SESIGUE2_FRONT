import { DataResponses } from "./helpers.interface"

export interface IntervencionEtapasResponses extends DataResponses {
  data: IntervencionEtapaResponse[]
}

export interface IntervencionEtapaResponse {
  intervencionEtapaId?: string,
  intervencionFaseID: string,
  nombre: string,
}