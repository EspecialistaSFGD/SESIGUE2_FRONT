import { DataResponses } from "./helpers.interface"

export interface InversionEtapasResponses extends DataResponses {
  data: InversionEtapaResponse[]
}

export interface InversionEtapaResponse {
    etapaID?: string,
    faseID: string,
    nombre: string,
}