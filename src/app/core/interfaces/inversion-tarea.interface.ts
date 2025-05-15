import { DataResponses } from "./helpers.interface"
import { InversionEspacioResponse } from "./inversion-espacio.interface"

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
	inversionEspacio: InversionEspacioResponse,
  create: boolean,
	inversionTarea: InversionTareaResponse
}