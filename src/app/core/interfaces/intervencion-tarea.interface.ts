import { DataResponses } from "./helpers.interface"
import { IntervencionEspacioResponse } from "./intervencion-espacio.interface"

export interface IntervencionTareasResponses extends DataResponses {
  data: IntervencionTareaResponse[]
}

export interface IntervencionTareaResponses extends DataResponses {
  data: IntervencionTareaResponse
}

export interface IntervencionTareaResponse {
	intervencionTareaId?: string,
	tarea: string,
	codigo?: string,
	plazo: string,
	comentarioSd?: string,
	estadoRegistro?: string,
	estadoRegistroNombre?: string,
	fechaValidacion?: string,
	comentario?: string,
	fechaCumplimiento?: string,
	accesoId?: string,
	accesoIdMod?: string,
	entidadId: string,
	entidad?:string,
	subTipo?:string,
	intervencionHitoId: string,
	intervencionHito?:string,
	intervencionEtapaId?: string,
	intervencionEtapa?: string,
	intervencionFaseId?: string,
	intervencionFase?: string,
	intervencionEspacioId: string,
	responsableId: string,
	responsable?: string,
	fechaRegistro?: string,
	validado?: boolean,
	estado?: boolean
}

export interface DataModalIntervencionTarea {
	intervencionEspacio: IntervencionEspacioResponse,
  	create: boolean,
	intervencionTarea: IntervencionTareaResponse
}