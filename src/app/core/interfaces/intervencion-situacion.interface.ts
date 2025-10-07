import { DataResponses } from "./helpers.interface";
import { IntervencionEspacioResponse } from "./intervencion-espacio.interface";
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
  usuarioId?: string,
  intervencionHitoActualId: string,
  intervencionHitoActual?: string,
  intervencionEtapaActualId?: string,
  intervencionEtapaActual?: string,
  intervencionFaseActualId?: string,
  intervencionFaseActual?: string,
}

export interface DataModalFormIntervencionSituacion {
    create: boolean
    intervencionEspacio: IntervencionResponse
}

export interface DataModalIntervencionSituacion {
    intervencionEspacio: IntervencionEspacioResponse
}