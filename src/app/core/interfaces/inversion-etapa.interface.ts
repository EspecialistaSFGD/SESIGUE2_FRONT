import { DataResponses } from "./helpers.interface"

export interface InversionEtapasResponses extends DataResponses {
  data: InversionEtapaResponse[]
}

export interface InversionEtapaResponse {
  inversionEtapaId?: string,
  inversionFaseID: string,
  nombre: string,
}