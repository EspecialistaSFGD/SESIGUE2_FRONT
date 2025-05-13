import { DataResponses } from "./helpers.interface"

export interface InversionFasesResponses extends DataResponses {
  data: InversionFaseResponse[]
}

export interface InversionFaseResponse {
    faseID?: string,
    tipoInversion: string,
    nombre: string,
}