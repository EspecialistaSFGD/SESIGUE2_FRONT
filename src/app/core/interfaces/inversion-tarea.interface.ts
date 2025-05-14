import { DataResponses } from "./helpers.interface"

export interface InversionTareasResponses extends DataResponses {
  data: InversionTareaResponse[]
}

export interface InversionTareaResponse {
	inversionTareaId?: string,
	codigo?: string,
	plazo: string,
	comentarioSd?: string,
	estadoRegistro?: string,
	fechaValidacion?: string,
	comentario?: string,
	fechaCumplimiento?: string,
	accesoId?: string,
	accesoIdMod?: string,
	entidadId: string,
	inversionHitoId: string,
	inversionId: string,
	responsableId: string,
	fechaRegistro?: string,
	validado?: boolean,
	estado?: boolean
}

export interface DataModalInversionTarea {
  create: boolean,
	inversionTarea: InversionTareaResponse
}