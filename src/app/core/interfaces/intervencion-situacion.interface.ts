import { DataResponses } from "./helpers.interface";
import { IntervencionResponse } from "./intervencion.interface";

export interface IntervencionSituacionesResponses extends DataResponses {
  data: IntervencionSituacionResponse[]
}

export interface intervencionSituacionResponses extends DataResponses {
  data: IntervencionSituacionResponse
}

export interface IntervencionSituacionResponse {
  intervencionSituacionId?: string,
  fecha?: string,
  situacion: string,
  intervencionId: string,
  usuarioRegistraId?: string,
  intervencionHitoActualId: string,
}

export interface DataModalFormIntervencionSituacion {
    create: boolean
    intervencion: IntervencionResponse
}