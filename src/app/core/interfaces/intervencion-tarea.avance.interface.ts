import { DataResponses } from "./helpers.interface"

export interface IntervencionTareaAvancesResponses extends DataResponses {
  data: IntervencionTareaAvanceResponse[]
}

export interface IntervencionTareaAvanceResponse {
	intervencionAvanceId?: string,
	fecha: string,
	avance: string,
	evidencia?: string,
	comentarioSd?: string,
	comentarioSector?: string,
	fechaComentarioSector?: string,
	comentarioGl?: string,
	fechaComentarioGl?: string,
	comentarioEntidad?: string,
	fechaComentarioEntidad?: string,
	validado?: boolean,
	fechaValidacion?: string,
	validaPcm?: string,
	fechaValidaPcm?: string,
	intervencionTareaId: string,
	accesoId?: string,
	accesoIdMod?: string,
	estadoRegistro: string,
	estadoRegistroNombre?: string,
	estado?: boolean,
}