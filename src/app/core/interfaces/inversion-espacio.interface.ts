import { DataResponses } from "./helpers.interface"

export interface InversionesEspaciosResponses extends DataResponses {
  data: InversionEspacioResponse[]
}

export interface InversionEspacioResponse {
	inversionEspacioId?: string
	tipoEventoId: string
	eventoId: string
	inversionId: string
	interaccionId: string
	acuerdoId: string
	estado?: string
	usuarioIdRegistro?: string
	usuarioIdModifica?: string
	fechaRegistro?: string
	sector?: string,
	departamento?: string,
	provincia?: string,
	distrito?: string,
	entidad?: string,
	tipo?: string,
	subtipo?: string,
	codigo?: string,
	nombre?: string,
	costo?: string,
	devAcum?: string,
	pia?: string,
	pim?: string,
	dev?: string,
	transferencia?: string,
	fecha?: string,
	situacion?: string,
	fase?: string,
	etapa?: string,
	hito?: string,
}